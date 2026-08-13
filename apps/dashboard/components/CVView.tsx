'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cvApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CvPromoModal } from '@/components/CvPromoModal';
import { CvHrdFloatingCta } from '@/components/CvHrdFloatingCta';
import { CvHrdModal } from '@/components/CvHrdModal';
import { AiAssistantDrawer } from '@/components/ai/AiAssistantDrawer';
import { BulletOptimizePopover } from '@/components/ai/BulletOptimizePopover';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDatePicker, isEndDateBeforeStartDate } from '@/components/ui/CustomDatePicker';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { BulletPointListInput } from '@/components/ui/BulletPointListInput';
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
  RotateCcw,
  Camera,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minus,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Instagram,
  Dribbble,
  Twitter,
  Youtube,
  Facebook,
  AlignLeft,
  AlignRight,
  Image as ImageIcon,
} from 'lucide-react';

export const renderSocialIcon = (platform?: string, className = 'w-3.5 h-3.5 text-slate-700 shrink-0') => {
  const p = (platform || 'github').toLowerCase();
  switch (p) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'dribbble':
      return <Dribbble className={className} />;
    case 'twitter':
    case 'x':
      return <Twitter className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'website':
    case 'portofolio':
      return <Globe className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'github':
    default:
      return <Github className={className} />;
  }
};

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const YEARS = Array.from({ length: 45 }, (_, i) => String(2026 - i));

export type MarginPresetType = 'normal' | 'narrow' | 'moderate' | 'wide' | 'mirrored' | 'custom';

export const MARGIN_PRESETS: Record<Exclude<MarginPresetType, 'custom'>, {
  name: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  labels: { top: string; bottom: string; left: string; right: string };
}> = {
  normal: {
    name: 'Normal',
    top: 2.54,
    bottom: 2.54,
    left: 2.54,
    right: 2.54,
    labels: { top: 'Top: 2,54 cm', bottom: 'Bottom: 2,54 cm', left: 'Left: 2,54 cm', right: 'Right: 2,54 cm' },
  },
  narrow: {
    name: 'Narrow',
    top: 1.27,
    bottom: 1.27,
    left: 1.27,
    right: 1.27,
    labels: { top: 'Top: 1,27 cm', bottom: 'Bottom: 1,27 cm', left: 'Left: 1,27 cm', right: 'Right: 1,27 cm' },
  },
  moderate: {
    name: 'Moderate',
    top: 2.54,
    bottom: 2.54,
    left: 1.91,
    right: 1.91,
    labels: { top: 'Top: 2,54 cm', bottom: 'Bottom: 2,54 cm', left: 'Left: 1,91 cm', right: 'Right: 1,91 cm' },
  },
  wide: {
    name: 'Wide',
    top: 2.54,
    bottom: 2.54,
    left: 5.08,
    right: 5.08,
    labels: { top: 'Top: 2,54 cm', bottom: 'Bottom: 2,54 cm', left: 'Left: 5,08 cm', right: 'Right: 5,08 cm' },
  },
  mirrored: {
    name: 'Mirrored',
    top: 2.54,
    bottom: 2.54,
    left: 3.18,
    right: 2.54,
    labels: { top: 'Top: 2,54 cm', bottom: 'Bottom: 2,54 cm', left: 'Inside: 3,18 cm', right: 'Outside: 2,54 cm' },
  },
};

const RenderBulletDescription: React.FC<{ text?: string; className?: string }> = ({
  text,
  className = 'text-xs leading-relaxed text-slate-700 text-justify break-words [word-break:break-word]',
}) => {
  if (!text || !text.trim()) return null;
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[\s•\-\*\d\.\)]+/, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <ul className="list-disc list-outside pl-4 space-y-1 my-1 break-words [word-break:break-word]">
      {lines.map((line, idx) => (
        <li key={idx} className={className}>
          {line}
        </li>
      ))}
    </ul>
  );
};

const RenderContactHeaderLinks: React.FC<{
  dummyData: any;
  separator?: string;
  className?: string;
  docLinkStyle?: 'blue' | 'underline' | 'plain';
  docShowIcons?: boolean;
}> = ({
  dummyData,
  separator = '•',
  className = 'text-xs flex flex-wrap gap-x-3 gap-y-1.5 items-center text-slate-700',
  docLinkStyle,
  docShowIcons,
}) => {
  const activeStyle = docLinkStyle || dummyData?.linkStyle || 'blue';
  const showIcons = docShowIcons !== undefined ? docShowIcons : (dummyData?.showIcons !== undefined ? dummyData.showIcons : true);

  const getLinkClass = () => {
    switch (activeStyle) {
      case 'underline':
        return 'text-slate-700 underline hover:text-blue-600 font-normal transition-colors';
      case 'plain':
        return 'text-slate-700 hover:underline font-normal transition-colors';
      case 'blue':
      default:
        return 'text-blue-700 underline hover:text-blue-800 font-medium transition-colors';
    }
  };

  const linkClass = getLinkClass();

  return (
    <div className={className}>
      {dummyData.email && (
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          {showIcons && <Mail className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
          <a href={getEmailMailto(dummyData.email)} className={linkClass}>
            {dummyData.email}
          </a>
        </span>
      )}
      {dummyData.phone && (
        <>
          {!showIcons && dummyData.email && <span className="text-slate-700">{separator}</span>}
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            {showIcons && <Phone className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
            <a href={getWaMeUrl(dummyData.phone)} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {dummyData.phone}
            </a>
          </span>
        </>
      )}
      {dummyData.location && (
        <>
          {!showIcons && (dummyData.email || dummyData.phone) && <span className="text-slate-700">{separator}</span>}
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            {showIcons && <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
            <span className="text-slate-700 font-normal">{dummyData.location}</span>
          </span>
        </>
      )}
      {dummyData.linkedin && (
        <>
          {!showIcons && (dummyData.email || dummyData.phone || dummyData.location) && <span className="text-slate-700">{separator}</span>}
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            {showIcons && <Linkedin className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
            <a href={getCleanUrl(dummyData.linkedin)} target="_blank" rel="noreferrer" className={linkClass}>
              {dummyData.linkedin}
            </a>
          </span>
        </>
      )}
      {dummyData.github && (
        <>
          {!showIcons && (dummyData.email || dummyData.phone || dummyData.location || dummyData.linkedin) && <span className="text-slate-700">{separator}</span>}
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            {showIcons && renderSocialIcon(dummyData.socialPlatform)}
            <a href={getSocialMediaUrl(dummyData.github, dummyData.socialPlatform)} target="_blank" rel="noreferrer" className={linkClass}>
              {dummyData.github}
            </a>
          </span>
        </>
      )}
      {dummyData.website && (
        <>
          {!showIcons && (dummyData.email || dummyData.phone || dummyData.location || dummyData.linkedin || dummyData.github) && <span className="text-slate-700">{separator}</span>}
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            {showIcons && <Globe className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
            <a href={getCleanUrl(dummyData.website)} target="_blank" rel="noreferrer" className={linkClass}>
              {dummyData.website}
            </a>
          </span>
        </>
      )}
    </div>
  );
};

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
  onPointerDown,
  onPointerMove,
  onPointerUp,
  isPointerDragging,
  dragOffsetY = 0,
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
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  isPointerDragging?: boolean;
  dragOffsetY?: number;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        transform: isPointerDragging ? `translateY(${dragOffsetY}px) scale(1.02)` : undefined,
        zIndex: isPointerDragging ? 50 : undefined,
        transition: isPointerDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
      }}
      className={`border rounded-xl bg-white dark:bg-slate-900 transition-all duration-200 relative touch-none ${
        isPointerDragging
          ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 bg-white dark:bg-slate-900 cursor-grabbing'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      <div
        onClick={onToggle}
        className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition border-b border-slate-100 dark:border-slate-800 rounded-t-xl cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 touch-none select-none"
            title="Tarik untuk mengatur posisi section di CV"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-white truncate group-hover:text-orange-500 transition">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="p-1 text-slate-500 dark:text-slate-400 group-hover:text-orange-500 rounded transition">
            {isOpen ? <ChevronUp className="w-4 h-4 text-orange-500" /> : <ChevronDown className="w-4 h-4" />}
          </div>
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

const COMMON_SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express.js',
  'Python', 'Java', 'C++', 'PHP', 'Laravel', 'HTML5 & CSS3', 'Tailwind CSS',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Git & GitHub',
  'REST API', 'GraphQL', 'UI/UX Design', 'Figma', 'Graphic Design',
  'Digital Marketing', 'SEO Optimization', 'Social Media Management',
  'Copywriting', 'Content Writing', 'Data Analysis', 'Microsoft Excel',
  'Microsoft Office', 'Project Management', 'Public Speaking', 'Communication',
  'Problem Solving', 'Leadership', 'Time Management', 'Customer Service',
];

const SkillsEditorSection: React.FC<{
  skills: string[];
  onChange: (skills: string[]) => void;
}> = ({ skills, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return COMMON_SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8);
    return COMMON_SKILL_SUGGESTIONS.filter(
      (s) => s.toLowerCase().includes(q) && !skills.includes(s)
    );
  }, [inputValue, skills]);

  const handleAddSkill = (skillToAdd?: string) => {
    const name = (skillToAdd || inputValue).trim();
    if (!name) return;
    if (!skills.includes(name)) {
      onChange([...skills, name]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (idx: number) => {
    onChange(skills.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3.5">
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
          Tambah Skill Utama (1 per 1)
        </label>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari atau ketik keahlian (contoh: React, Public Speaking)..."
              value={inputValue}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowDropdown(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
            />

            {/* Dropdown Suggestions */}
            {showDropdown && (filteredSuggestions.length > 0 || inputValue.trim()) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto p-1">
                {filteredSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddSkill(sug)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{sug}</span>
                    <Plus className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
                {inputValue.trim() && !filteredSuggestions.some(s => s.toLowerCase() === inputValue.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => handleAddSkill(inputValue.trim())}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition cursor-pointer flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <span>Tambah &quot;{inputValue.trim()}&quot; sebagai keahlian baru</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleAddSkill()}
            className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Added Skill Badges */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {skills.filter(Boolean).map((sk, skIdx) => (
          <span
            key={skIdx}
            className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center gap-2 shadow-2xs"
          >
            {sk}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skIdx)}
              className="w-4 h-4 rounded-full bg-teal-200/60 dark:bg-teal-800/60 hover:bg-rose-500 hover:text-white text-teal-700 dark:text-teal-300 flex items-center justify-center transition cursor-pointer text-[10px]"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
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
  period?: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  tech?: string;
  url?: string;
  link?: string; // legacy, dipertahankan untuk backward compat
  date?: string; // legacy, dipertahankan untuk backward compat
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface OrganizationItem {
  id: string;
  role: string;
  name: string;
  startDate?: string;
  endDate?: string;
  period?: string;
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
  credentialId?: string;
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
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  period?: string;
  description?: string;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  period?: string;
  description?: string;
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  period?: string;
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
  note?: string;
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
  photoShape?: 'circle' | 'square';
  photoPosition?: 'left' | 'right';

  // 2. Informasi Kontak & Social Media
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  socialPlatform?: string;
  socialHandle?: string;

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
  docFontFamily?: 'sans' | 'serif' | 'mono' | 'standard';
  docFontSize?: 'sm' | 'base' | 'md' | 'lg';
  docSpacing?: 'compact' | 'normal' | 'spacious';
  docShowIcons?: boolean;
  docNameSize?: number;
  docHeaderSize?: number;
  docBodySize?: number;
  docSectionSpacing?: number;
  docLineHeight?: number;
  docLetterSpacing?: number;
  docLinkStyle?: 'blue' | 'underline' | 'plain';
  docMarginPreset?: MarginPresetType;
  docMarginTop?: number;
  docMarginBottom?: number;
  docMarginLeft?: number;
  docMarginRight?: number;
  docRefEmailHyperlink?: boolean;
  docRefPhoneHyperlink?: boolean;
  docProjectLinkStyle?: 'name' | 'text' | 'none';
}

export const getEmailMailto = (emailStr?: string) => {
  if (!emailStr) return '#';
  const clean = emailStr.replace(/^mailto:/i, '').trim();
  return `mailto:${clean}`;
};

export const getCleanUrl = (url?: string, defaultPrefix = 'https://') => {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) return trimmed;
  return `${defaultPrefix}${trimmed}`;
};

export const getWaMeUrl = (phoneStr?: string) => {
  if (!phoneStr) return '#';
  let digits = phoneStr.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  } else if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }
  return `https://wa.me/${digits}`;
};

export const getSocialMediaUrl = (handle?: string, platform = 'github') => {
  if (!handle) return '#';
  const trimmed = handle.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@/, '');
  switch ((platform || '').toLowerCase()) {
    case 'github':
      return `https://github.com/${cleanHandle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanHandle}`;
    case 'dribbble':
      return `https://dribbble.com/${cleanHandle}`;
    case 'pinterest':
      return `https://pinterest.com/${cleanHandle}`;
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'twitter':
    case 'x':
      return `https://x.com/${cleanHandle}`;
    default:
      return getCleanUrl(trimmed);
  }
};

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
  const [isHrdModalOpen, setIsHrdModalOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(true);

  // Contextual AI Assistant State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerSectionKey, setAiDrawerSectionKey] = useState('experience');
  const [aiDrawerSectionTitle, setAiDrawerSectionTitle] = useState('Pengalaman Kerja');
  const [aiDrawerContent, setAiDrawerContent] = useState('');
  const [aiApplyHandler, setAiApplyHandler] = useState<((newVal: string, feedback: string) => void) | null>(null);

  const [isBulletPopoverOpen, setIsBulletPopoverOpen] = useState(false);
  const [targetBulletText, setTargetBulletText] = useState('');
  const [bulletApplyHandler, setBulletApplyHandler] = useState<((newVal: string, feedback: string) => void) | null>(null);

  const [aiToastMessage, setAiToastMessage] = useState<string | null>(null);

  const handleOpenAiDrawer = (
    key: string,
    title: string,
    content: string,
    applyFn: (newVal: string, feedback: string) => void
  ) => {
    setAiDrawerSectionKey(key);
    setAiDrawerSectionTitle(title);
    setAiDrawerContent(content);
    setAiApplyHandler(() => applyFn);
    setIsAiDrawerOpen(true);
  };

  const handleOpenBulletPopover = (
    bulletText: string,
    applyFn: (newVal: string, feedback: string) => void
  ) => {
    setTargetBulletText(bulletText);
    setBulletApplyHandler(() => applyFn);
    setIsBulletPopoverOpen(true);
  };

  const handleAiSuccessFeedback = (feedbackMsg: string) => {
    setAiToastMessage(feedbackMsg);
    setTimeout(() => {
      setAiToastMessage(null);
    }, 4000);

    if (selectedCV) {
      const currentScore = selectedCV.atsScore ?? 85;
      const newScore = Math.min(98, currentScore + 3);
      setSelectedCV({ ...selectedCV, atsScore: newScore });
    }
  };
  const [deletingCvTarget, setDeletingCvTarget] = useState<CVData | null>(null);
  const lastSavedSnapshotRef = useRef<string>('');
  const prevCvIdRef = useRef<string | undefined | null>(undefined);

  // Set isMounted on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load cvList from API on mount
  useEffect(() => {
    cvApi.getAll<CVData>().then((remoteCvs) => {
      if (Array.isArray(remoteCvs) && remoteCvs.length > 0) {
        setCvList(remoteCvs);
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cuti_cv_list');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCvList(parsed);
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
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

    // Try finding in list or individual key
    let cv = activeCvList.find((c) => c.id === cvId);
    if (!cv && typeof window !== 'undefined') {
      const storedSingle = localStorage.getItem(`cuti_cv_data_${cvId}`);
      if (storedSingle) {
        try {
          cv = JSON.parse(storedSingle);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (cv) {
      setSelectedCV(cv);
      setTitleInput(cv.title);
      setFormData({
        firstName: cv.firstName || '',
        lastName: cv.lastName || '',
        fullName: cv.fullName || '',
        headline: cv.headline || '',
        photoUrl: cv.photoUrl || '',
        email: cv.email || '',
        phone: cv.phone || '',
        website: cv.website || '',
        linkedin: cv.linkedin || '',
        github: cv.github || '',
        city: cv.city || '',
        province: cv.province || '',
        country: cv.country || '',
        location: cv.location || '',
        summary: cv.summary || '',
        skills: cv.skills ? [...cv.skills] : [],
        skillsList: cv.skillsList ? [...cv.skillsList] : [],
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
      if (cv.docFontFamily) setDocFontFamily(cv.docFontFamily);
      if (cv.docFontSize) setDocFontSize(cv.docFontSize);
      if (cv.docSpacing) setDocSpacing(cv.docSpacing);
      if (cv.docShowIcons !== undefined) setDocShowIcons(cv.docShowIcons);
      if (cv.docNameSize !== undefined) setDocNameSize(cv.docNameSize);
      if (cv.docHeaderSize !== undefined) setDocHeaderSize(cv.docHeaderSize);
      if (cv.docBodySize !== undefined) setDocBodySize(cv.docBodySize);
      if (cv.docSectionSpacing !== undefined) setDocSectionSpacing(cv.docSectionSpacing);
      if (cv.docLineHeight !== undefined) setDocLineHeight(cv.docLineHeight);
      if (cv.docLetterSpacing !== undefined) setDocLetterSpacing(cv.docLetterSpacing);
      if (cv.docLinkStyle) setDocLinkStyle(cv.docLinkStyle);
      if (cv.docMarginTop !== undefined) setDocMarginTop(cv.docMarginTop);
      if (cv.docMarginBottom !== undefined) setDocMarginBottom(cv.docMarginBottom);
      if (cv.docMarginLeft !== undefined) setDocMarginLeft(cv.docMarginLeft);
      if (cv.docMarginRight !== undefined) setDocMarginRight(cv.docMarginRight);
    } else {
      const fallbackCv: CVData = {
        id: cvId,
        title: `CV Senior Software Engineer - John Doe`,
        updatedAt: 'Hari ini',
        atsScore: 95,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        headline: 'Senior Software Engineer / Project Manager',
        photoUrl: 'https://example.com/foto-profil.jpg',
        email: 'john.doe@example.com',
        phone: '+62 812-3456-7890',
        website: 'johndoe.dev',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        country: 'Indonesia',
        location: 'Jakarta, Indonesia',
        summary:
          'Senior Software Engineer berpengalaman dalam membangun aplikasi web berkinerja tinggi, scalable, dan ATS friendly.',
        skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST API'],
        skillsList: [
          { id: 'sk-1', name: 'TypeScript', level: 'Expert' },
          { id: 'sk-2', name: 'React', level: 'Expert' },
          { id: 'sk-3', name: 'Next.js', level: 'Expert' },
          { id: 'sk-4', name: 'Node.js', level: 'Advanced' },
          { id: 'sk-5', name: 'Tailwind CSS', level: 'Advanced' },
          { id: 'sk-6', name: 'PostgreSQL', level: 'Advanced' },
          { id: 'sk-7', name: 'Git', level: 'Advanced' },
          { id: 'sk-8', name: 'REST API', level: 'Advanced' },
        ],
        experience: [
          {
            id: 'exp-1',
            company: 'PT Inovasi Teknologi',
            role: 'Senior Software Engineer',
            location: 'Jakarta, Indonesia',
            website: 'acmecorp.com',
            startDate: 'Jan 2021',
            endDate: 'Sekarang',
            isCurrent: true,
            period: 'Jan 2021 - Sekarang',
            description:
              'Memimpin pengembangan fitur frontend & backend, mengoptimalkan kecepatan load hingga 45%, dan mengimplementasikan CI/CD.',
          },
        ],
        internships: [
          {
            id: 'int-1',
            company: 'Tech Startup Indonesia',
            role: 'UI/UX & Frontend Intern',
            location: 'Jakarta, Indonesia',
            startDate: 'Jan 2023',
            endDate: 'Jun 2023',
            period: 'Jan 2023 - Jun 2023',
            description:
              'Membantu tim merancang wireframe dan mendesain 10+ komponen UI serta mengimplementasikannya dengan TailwindCSS.',
          },
        ],
        projects: [
          {
            id: 'proj-1',
            name: 'E-Commerce Platform',
            role: 'Lead Developer',
            link: 'https://project.com',
            tech: 'React, Node.js, TailwindCSS • https://project.com',
            date: '2023 - 2024',
            description:
              'Membangun aplikasi toko online dengan fitur payment gateway dan real-time analytics.',
          },
        ],
        organizations: [
          {
            id: 'org-1',
            name: 'Himpunan Mahasiswa Informatika',
            role: 'Ketua Divisi Acara',
            startDate: '2022',
            endDate: '2023',
            period: '2022 - 2023',
            description:
              'Mengkoordinasikan seminar teknologi nasional dengan 500+ peserta dan mengelola pendaftaran peserta.',
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'Universitas Indonesia',
            degree: 'S1 Teknik Informatika / Ilmu Komputer (IPK 3.75)',
            location: 'Depok, Jawa Barat',
            gpa: '3.75 / 4.00',
            startDate: '2017',
            endDate: '2021',
            year: '2017 - 2021',
          },
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: 'Nov 2023',
            link: 'aws.amazon.com/verification',
          },
        ],
        languages: [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Professional' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
        courses: [
          {
            id: 'crs-1',
            courseName: 'Digital Marketing Mastery',
            institution: 'RevoU / Google Academy',
            month: 'Desember',
            year: '2023',
            description: 'Strategi pemasaran digital dan analisis data.',
          },
        ],
        scholarships: [
          {
            id: 'sch-1',
            name: 'Beasiswa Djarum Beasiswa Plus',
            provider: 'Djarum Foundation',
            month: 'September',
            year: '2020',
            description: 'Program pelatihan kepemimpinan dan beasiswa prestasi.',
          },
        ],
        volunteers: [
          {
            id: 'vol-1',
            organization: 'Palang Merah Indonesia',
            role: 'Tim Tanggap Bencana',
            location: 'Jakarta',
            startMonth: 'Januari',
            startYear: '2022',
            isCurrent: true,
            description: 'Mengkoordinasikan logistik darurat dan posko bantuan bencana.',
          },
        ],
        references: [
          {
            id: 'ref-1',
            fullName: 'John Smith',
            title: 'Engineering Director',
            company: 'PT Inovasi Teknologi',
            email: 'john.smith@example.com',
            phone: '+62 812-3456-7890',
            note: 'Referensi tersedia atas permintaan',
          },
        ],
      };

      setSelectedCV(fallbackCv);
      setTitleInput(fallbackCv.title);
      setFormData({
        firstName: fallbackCv.firstName,
        lastName: fallbackCv.lastName,
        fullName: fallbackCv.fullName,
        headline: fallbackCv.headline,
        photoUrl: fallbackCv.photoUrl,
        email: fallbackCv.email,
        phone: fallbackCv.phone,
        website: fallbackCv.website,
        linkedin: fallbackCv.linkedin,
        github: fallbackCv.github,
        city: fallbackCv.city,
        province: fallbackCv.province,
        country: fallbackCv.country,
        location: fallbackCv.location,
        summary: fallbackCv.summary,
        skills: fallbackCv.skills ? [...fallbackCv.skills] : [],
        skillsList: fallbackCv.skillsList ? [...fallbackCv.skillsList] : [],
        experience: fallbackCv.experience ? [...fallbackCv.experience] : [],
        education: fallbackCv.education ? [...fallbackCv.education] : [],
        internships: fallbackCv.internships ? [...fallbackCv.internships] : [],
        projects: fallbackCv.projects ? [...fallbackCv.projects] : [],
        organizations: fallbackCv.organizations ? [...fallbackCv.organizations] : [],
        certifications: fallbackCv.certifications ? [...fallbackCv.certifications] : [],
        languages: fallbackCv.languages ? [...fallbackCv.languages] : [],
        courses: fallbackCv.courses ? [...fallbackCv.courses] : [],
        scholarships: fallbackCv.scholarships ? [...fallbackCv.scholarships] : [],
        volunteers: fallbackCv.volunteers ? [...fallbackCv.volunteers] : [],
        references: fallbackCv.references ? [...fallbackCv.references] : [],
      });

      if (typeof window !== 'undefined') {
        const updatedList = [fallbackCv, ...activeCvList.filter((c) => c.id !== cvId)];
        setCvList(updatedList);
        localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
        localStorage.setItem(`cuti_cv_data_${cvId}`, JSON.stringify(fallbackCv));
      }
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
  const [templateFormSubmitted, setTemplateFormSubmitted] = useState<boolean>(false);

  // Document Layout & Formatting Settings State
  const [rightPanelTab, setRightPanelTab] = useState<'editor' | 'templates' | 'pengaturan'>('editor');
  const [showLayoutSelector, setShowLayoutSelector] = useState<boolean>(false);
  const [showDocSettings, setShowDocSettings] = useState<boolean>(false);
  const [docFontFamily, setDocFontFamily] = useState<'sans' | 'serif' | 'mono' | 'standard'>('sans');
  const [docFontSize, setDocFontSize] = useState<'sm' | 'base' | 'md' | 'lg'>('base');
  const [docSpacing, setDocSpacing] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [docShowIcons, setDocShowIcons] = useState<boolean>(true);
  const [docPhotoPosition, setDocPhotoPosition] = useState<'left' | 'right'>('right');
  const [docNameSize, setDocNameSize] = useState<number>(30);
  const [docHeaderSize, setDocHeaderSize] = useState<number>(14);
  const [docBodySize, setDocBodySize] = useState<number>(12);
  const [docSectionSpacing, setDocSectionSpacing] = useState<number>(20);
  const [docLineHeight, setDocLineHeight] = useState<number>(1.4);
  const [docLetterSpacing, setDocLetterSpacing] = useState<number>(0);
  const [docLinkStyle, setDocLinkStyle] = useState<'blue' | 'underline' | 'plain'>('blue');
  const [docMarginPreset, setDocMarginPreset] = useState<MarginPresetType>('narrow');
  const [docMarginTop, setDocMarginTop] = useState<number>(1.27);
  const [docMarginBottom, setDocMarginBottom] = useState<number>(1.27);
  const [docMarginLeft, setDocMarginLeft] = useState<number>(1.27);
  const [docMarginRight, setDocMarginRight] = useState<number>(1.27);
  const [docRefEmailHyperlink, setDocRefEmailHyperlink] = useState<boolean>(true);
  const [docRefPhoneHyperlink, setDocRefPhoneHyperlink] = useState<boolean>(true);
  const [docProjectLinkStyle, setDocProjectLinkStyle] = useState<'name' | 'text' | 'none'>('text');
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');

  const handleSelectMarginPreset = (preset: Exclude<MarginPresetType, 'custom'>) => {
    setDocMarginPreset(preset);
    const data = MARGIN_PRESETS[preset];
    if (data) {
      setDocMarginTop(data.top);
      setDocMarginBottom(data.bottom);
      setDocMarginLeft(data.left);
      setDocMarginRight(data.right);
    }
  };

  const handleCustomMarginChange = (side: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    setDocMarginPreset('custom');
    if (side === 'top') setDocMarginTop(val);
    if (side === 'bottom') setDocMarginBottom(val);
    if (side === 'left') setDocMarginLeft(val);
    if (side === 'right') setDocMarginRight(val);
  };

  const handleResetDocStyles = () => {
    setDocFontFamily('sans');
    setDocFontSize('base');
    setDocSpacing('normal');
    setDocShowIcons(true);
    setDocNameSize(30);
    setDocHeaderSize(14);
    setDocBodySize(12);
    setDocSectionSpacing(20);
    setDocLineHeight(1.4);
    setDocLetterSpacing(0);
    setDocLinkStyle('blue');
    setDocMarginPreset('narrow');
    setDocMarginTop(1.27);
    setDocMarginBottom(1.27);
    setDocMarginLeft(1.27);
    setDocMarginRight(1.27);
  };

  const handleImportResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            setFormData((prev) => ({ ...prev, ...parsed }));
            alert('File JSON resume berhasil di-import!');
          }
        } catch (err) {
          alert('Gagal membaca format JSON resume.');
        }
      };
      reader.readAsText(file);
    } else {
      alert(`File resume "${file.name}" berhasil diunggah! Data ringkasan telah di-import ke form editor.`);
    }
  };

  const handleDownloadCV = () => {
    if (downloadFormat === 'pdf') {
      window.print();
    } else {
      alert(`Mengunduh file DOCX: "${titleInput || 'CV_Lamar_Kerja.docx'}"...`);
    }
  };

  // Template Form Validation
  const isNewCvTitleValid = newCvTitle.trim().length > 0;
  const isNewCvJobTitleValid = newCvJobTitle.trim().length > 0;
  const isNewCvFileValid = newCvStartMode !== 'import' || newCvFile !== null;
  const isTemplateFormValid = isNewCvTitleValid && isNewCvJobTitleValid && isNewCvFileValid;

  const handleCreateCvFromTemplate = () => {
    setTemplateFormSubmitted(true);
    if (!isTemplateFormValid) {
      return;
    }

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
  };

  const handleSelectTemplateAndNext = () => {
    const templateName = cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS';
    setNewCvTitle(`CV ATS - ${templateName}`);
    setNewCvJobTitle('');
    setNewCvStartMode('example');
    setNewCvFile(null);
    setTemplateFormSubmitted(false);
    setTemplateModalStep(2);
  };

  useEffect(() => {
    if (!showTemplateModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (templateModalStep === 1) {
        const availableTemplates = cvTemplates.filter((tpl) => !tpl.hidden);
        const currentIndex = availableTemplates.findIndex((t) => t.id === selectedTemplateId);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentIndex < availableTemplates.length - 1) {
            setSelectedTemplateId(availableTemplates[currentIndex + 1].id);
          } else if (currentIndex === -1 && availableTemplates.length > 0) {
            setSelectedTemplateId(availableTemplates[0].id);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedTemplateId(availableTemplates[currentIndex - 1].id);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSelectTemplateAndNext();
        }
      } else if (e.key === 'Escape') {
        setShowTemplateModal(false);
        setTemplateModalStep(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTemplateModal, templateModalStep, selectedTemplateId, cvTemplates]);

  useEffect(() => {
    if (showTemplateModal && templateModalStep === 1 && selectedTemplateId) {
      const selectedEl = document.getElementById(`template-card-${selectedTemplateId}`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedTemplateId, showTemplateModal, templateModalStep]);

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
  // Form State for Manual CV & Wizard
  const [formData, setFormData] = useState<Omit<CVData, 'id' | 'updatedAt' | 'atsScore' | 'title'>>({
    sectionOrder: DEFAULT_SECTION_ORDER,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    headline: 'Senior Software Engineer / Project Manager',
    photoUrl: 'https://example.com/foto-profil.jpg',
    email: 'john.doe@example.com',
    phone: '+62 812-3456-7890',
    website: 'johndoe.dev',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    instagram: '',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    country: 'Indonesia',
    location: 'Jakarta, Indonesia',
    summary:
      'Senior Software Engineer berpengalaman dalam membangun aplikasi web berkinerja tinggi, scalable, dan ATS friendly.',
    experience: [
      {
        id: 'exp-1',
        company: 'PT Inovasi Teknologi',
        role: 'Senior Software Engineer',
        location: 'Jakarta, Indonesia',
        website: 'acmecorp.com',
        startDate: 'Jan 2021',
        endDate: 'Sekarang',
        isCurrent: true,
        period: 'Jan 2021 - Sekarang',
        description:
          'Memimpin pengembangan fitur frontend & backend, mengoptimalkan kecepatan load hingga 45%, dan mengimplementasikan CI/CD.',
        achievements: 'Mengoptimalkan kecepatan load hingga 45% dan otomasi CI/CD.',
      },
    ],
    internships: [
      {
        id: 'int-1',
        company: 'Tech Startup Indonesia',
        role: 'UI/UX & Frontend Intern',
        location: 'Jakarta, Indonesia',
        website: 'techstartup.id',
        startDate: 'Jan 2023',
        endDate: 'Jun 2023',
        period: 'Jan 2023 - Jun 2023',
        description:
          'Membantu tim merancang wireframe dan mendesain 10+ komponen UI serta mengimplementasikannya dengan TailwindCSS.',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'E-Commerce Platform',
        role: 'Lead Developer',
        link: 'https://project.com',
        tech: 'React, Node.js, TailwindCSS • https://project.com',
        date: '2023 - 2024',
        description:
          'Membangun aplikasi toko online dengan fitur payment gateway dan real-time analytics.',
      },
    ],
    organizations: [
      {
        id: 'org-1',
        name: 'Himpunan Mahasiswa Informatika',
        role: 'Ketua Divisi Acara',
        startDate: '2022',
        endDate: '2023',
        period: '2022 - 2023',
        description:
          'Mengkoordinasikan seminar teknologi nasional dengan 500+ peserta dan mengelola pendaftaran peserta.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universitas Indonesia',
        degree: 'S1 Teknik Informatika / Ilmu Komputer (IPK 3.75)',
        location: 'Depok, Jawa Barat',
        gpa: '3.75 / 4.00',
        startDate: '2017',
        endDate: '2021',
        year: '2017 - 2021',
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: 'Nov 2023',
        link: 'aws.amazon.com/verification',
      },
    ],
    skillsList: [
      { id: 'sk-1', name: 'TypeScript', level: 'Expert' },
      { id: 'sk-2', name: 'React', level: 'Expert' },
      { id: 'sk-3', name: 'Next.js', level: 'Expert' },
      { id: 'sk-4', name: 'Node.js', level: 'Advanced' },
      { id: 'sk-5', name: 'Tailwind CSS', level: 'Advanced' },
      { id: 'sk-6', name: 'PostgreSQL', level: 'Advanced' },
      { id: 'sk-7', name: 'Git', level: 'Advanced' },
      { id: 'sk-8', name: 'REST API', level: 'Advanced' },
    ],
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Tailwind CSS',
      'PostgreSQL',
      'Git',
      'REST API',
    ],
    languages: [
      { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Professional' },
      { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
    ],
    courses: [
      {
        id: 'crs-1',
        courseName: 'Digital Marketing Mastery',
        institution: 'RevoU / Google Academy',
        month: 'Desember',
        year: '2023',
        description: 'Strategi pemasaran digital dan analisis data.',
      },
    ],
    scholarships: [
      {
        id: 'sch-1',
        name: 'Beasiswa Djarum Beasiswa Plus',
        provider: 'Djarum Foundation',
        month: 'September',
        year: '2020',
        description: 'Program pelatihan kepemimpinan dan beasiswa prestasi.',
      },
    ],
    volunteers: [
      {
        id: 'vol-1',
        organization: 'Palang Merah Indonesia',
        role: 'Tim Tanggap Bencana',
        location: 'Jakarta',
        startMonth: 'Januari',
        startYear: '2022',
        endMonth: '',
        endYear: '',
        isCurrent: true,
        description: 'Mengkoordinasikan logistik darurat dan posko bantuan bencana.',
      },
    ],
    references: [
      {
        id: 'ref-1',
        fullName: 'John Smith',
        title: 'Engineering Director',
        company: 'PT Inovasi Teknologi',
        email: 'john.smith@example.com',
        phone: '+62 812-3456-7890',
        note: 'Referensi tersedia atas permintaan',
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

  // Pointer-based Section Drag & Drop State & Handlers
  const [pointerDragIdx, setPointerDragIdx] = useState<number | null>(null);
  const [pointerOffsetY, setPointerOffsetY] = useState<number>(0);
  const pointerStartYRef = useRef<number>(0);
  const pointerDragIdxRef = useRef<number | null>(null);
  const sectionOrderArrayRef = useRef<string[]>([]);
  const dragClientYRef = useRef<number | null>(null);

  // Profile Photo Upload Ref & Handler (Interactive Crop, Resize & Position Adjustment)
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoCropModal, setShowPhotoCropModal] = useState<boolean>(false);
  const [rawPhotoDataUrl, setRawPhotoDataUrl] = useState<string>('');
  const [photoScale, setPhotoScale] = useState<number>(1);
  const [photoOffsetX, setPhotoOffsetX] = useState<number>(0);
  const [photoOffsetY, setPhotoOffsetY] = useState<number>(0);
  const [photoShape, setPhotoShape] = useState<'circle' | 'square'>('circle');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const photoDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const formatPhone62 = (input: string): string => {
    if (!input) return '+62 ';
    let val = input.trim();
    if (!val.startsWith('+62')) {
      let digits = val.replace(/\D/g, '');
      if (digits.startsWith('0')) {
        digits = digits.substring(1);
      } else if (digits.startsWith('62')) {
        digits = digits.substring(2);
      }
      return `+62 ${digits}`;
    }
    return val;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto profil maksimal 2MB. Silakan pilih foto dengan ukuran lebih kecil.');
      if (photoFileInputRef.current) photoFileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawPhotoDataUrl(event.target?.result as string);
      setPhotoScale(1);
      setPhotoOffsetX(0);
      setPhotoOffsetY(0);
      setShowPhotoCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleEditExistingPhoto = () => {
    if (!formData.photoUrl) return;
    setRawPhotoDataUrl(rawPhotoDataUrl || formData.photoUrl);
    setPhotoShape(formData.photoShape || 'circle');
    setPhotoScale(1);
    setPhotoOffsetX(0);
    setPhotoOffsetY(0);
    setShowPhotoCropModal(true);
  };

  const handleApplyCroppedPhoto = () => {
    if (!rawPhotoDataUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const containerSize = 280;
      const baseCropSize = 160;
      const cropSizeDisp = baseCropSize / photoScale;

      const scaleRatio = Math.min(containerSize / img.width, containerSize / img.height);
      const dispW = img.width * scaleRatio;
      const dispH = img.height * scaleRatio;
      const imgLeftDisp = (containerSize - dispW) / 2;
      const imgTopDisp = (containerSize - dispH) / 2;

      const cropLeftDisp = (containerSize / 2) + photoOffsetX - (cropSizeDisp / 2);
      const cropTopDisp = (containerSize / 2) + photoOffsetY - (cropSizeDisp / 2);

      const relXDisp = cropLeftDisp - imgLeftDisp;
      const relYDisp = cropTopDisp - imgTopDisp;

      const srcX = relXDisp / scaleRatio;
      const srcY = relYDisp / scaleRatio;
      const srcW = cropSizeDisp / scaleRatio;
      const srcH = cropSizeDisp / scaleRatio;

      const canvas = document.createElement('canvas');
      const targetSize = 400; // 400x400 output WebP avatar
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);

        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetSize, targetSize);

        const webpDataUrl = canvas.toDataURL('image/webp', 0.88);
        setFormData((prev) => ({ ...prev, photoUrl: webpDataUrl, photoShape }));
        setShowPhotoCropModal(false);
      }
    };
    img.src = rawPhotoDataUrl;
  };

  const activeSectionOrder = formData.sectionOrder && formData.sectionOrder.length > 0
    ? formData.sectionOrder
    : DEFAULT_SECTION_ORDER;

  const moveSectionUpDown = (index: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeSectionOrder.length) return;
    const newOrder = [...activeSectionOrder];
    const [item] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, item);
    setFormData((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    if (e.button !== 0) return;
    const handleEl = e.currentTarget as HTMLElement;
    try { handleEl.setPointerCapture(e.pointerId); } catch {}

    const currentList = [...activeSectionOrder];
    sectionOrderArrayRef.current = currentList;

    pointerDragIdxRef.current = index;
    dragClientYRef.current = e.clientY;
    setPointerDragIdx(index);
    pointerStartYRef.current = e.clientY;
    setPointerOffsetY(0);
  };

  // Movement is handled by global window 'pointermove' listener
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePointerMove = (_e: React.PointerEvent, _index: number) => {
    /* noop — window listener handles movement */
  };

  const handlePointerUp = () => {
    pointerDragIdxRef.current = null;
    sectionOrderArrayRef.current = [];
    dragClientYRef.current = null;
    setPointerDragIdx(null);
    setPointerOffsetY(0);
  };

  // Global window listener for Section Drag & Drop
  useEffect(() => {
    if (pointerDragIdx === null) return;

    const onSectionWindowUp = () => {
      pointerDragIdxRef.current = null;
      sectionOrderArrayRef.current = [];
      dragClientYRef.current = null;
      setPointerDragIdx(null);
      setPointerOffsetY(0);
    };

    const onSectionWindowMove = (e: PointerEvent) => {
      // Safety check: cancel if primary mouse click button is released
      if (e.buttons === 0) {
        onSectionWindowUp();
        return;
      }

      dragClientYRef.current = e.clientY;

      const currentIdx = pointerDragIdxRef.current;
      if (currentIdx === null) return;

      const deltaY = e.clientY - pointerStartYRef.current;
      const threshold = 55;
      const list = sectionOrderArrayRef.current;

      if (deltaY > threshold) {
        if (currentIdx < list.length - 1) {
          const nextIdx = currentIdx + 1;
          const newArr = [...list];
          const [item] = newArr.splice(currentIdx, 1);
          newArr.splice(nextIdx, 0, item);

          // Synchronous ref updates for zero latency
          sectionOrderArrayRef.current = newArr;
          pointerStartYRef.current = e.clientY;
          pointerDragIdxRef.current = nextIdx;

          setPointerDragIdx(nextIdx);
          setPointerOffsetY(0);
          setFormData((prev) => ({ ...prev, sectionOrder: newArr }));
        }
      } else if (deltaY < -threshold) {
        if (currentIdx > 0) {
          const nextIdx = currentIdx - 1;
          const newArr = [...list];
          const [item] = newArr.splice(currentIdx, 1);
          newArr.splice(nextIdx, 0, item);

          // Synchronous ref updates for zero latency
          sectionOrderArrayRef.current = newArr;
          pointerStartYRef.current = e.clientY;
          pointerDragIdxRef.current = nextIdx;

          setPointerDragIdx(nextIdx);
          setPointerOffsetY(0);
          setFormData((prev) => ({ ...prev, sectionOrder: newArr }));
        }
      } else {
        setPointerOffsetY(deltaY);
      }
    };

    window.addEventListener('pointerup', onSectionWindowUp);
    window.addEventListener('pointermove', onSectionWindowMove);
    window.addEventListener('pointercancel', onSectionWindowUp);
    window.addEventListener('blur', onSectionWindowUp);
    return () => {
      window.removeEventListener('pointerup', onSectionWindowUp);
      window.removeEventListener('pointermove', onSectionWindowMove);
      window.removeEventListener('pointercancel', onSectionWindowUp);
      window.removeEventListener('blur', onSectionWindowUp);
    };
  // Re-register whenever drag starts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointerDragIdx === null]);

  // Generic Sub-Item Pointer Dragging Helper for all 9 sections
  const [subItemDragKey, setSubItemDragKey] = useState<string | null>(null);
  const [subItemDragIdx, setSubItemDragIdx] = useState<number | null>(null);
  const [subItemOffsetY, setSubItemOffsetY] = useState<number>(0);
  const subItemStartYRef = useRef<number>(0);
  // Refs mirror state so window listeners always see current values synchronously
  const subItemDragKeyRef = useRef<string | null>(null);
  const subItemDragIdxRef = useRef<number | null>(null);
  // Synchronous array ref maintained during dragging to prevent async React state lag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subItemArrayRef = useRef<any[]>([]);

  // Helper to retrieve the actual layout scroll container (#main-content-scroll) or window
  const getScrollContainer = (): Element | Window => {
    if (typeof document === 'undefined') return window;
    const mainEl = document.getElementById('main-content-scroll') || document.querySelector('main');
    if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
      return mainEl;
    }
    return window;
  };

  // Auto-scroll viewport/container continuously during section or sub-item dragging near screen edges
  useEffect(() => {
    if (pointerDragIdx === null && subItemDragIdx === null) {
      dragClientYRef.current = null;
      return;
    }

    let animationFrameId: number;

    const performAutoScroll = () => {
      const clientY = dragClientYRef.current;
      if (clientY !== null) {
        const edgeThreshold = 140;
        const windowHeight = window.innerHeight;
        const container = getScrollContainer();

        let scrollAmount = 0;

        if (clientY > windowHeight - edgeThreshold) {
          const intensity = Math.min(1, (clientY - (windowHeight - edgeThreshold)) / edgeThreshold);
          scrollAmount = Math.max(12, Math.round(intensity * 32));
        } else if (clientY < edgeThreshold) {
          const intensity = Math.min(1, (edgeThreshold - clientY) / edgeThreshold);
          scrollAmount = -Math.max(12, Math.round(intensity * 32));
        }

        if (scrollAmount !== 0) {
          const oldScrollTop = container instanceof Window ? container.scrollY : (container as Element).scrollTop;

          if ('scrollBy' in container && typeof container.scrollBy === 'function') {
            container.scrollBy({ top: scrollAmount, behavior: 'instant' as ScrollBehavior });
          } else {
            window.scrollBy({ top: scrollAmount, behavior: 'instant' as ScrollBehavior });
          }

          const newScrollTop = container instanceof Window ? container.scrollY : (container as Element).scrollTop;
          const actualScrollAmount = newScrollTop - oldScrollTop;

          if (actualScrollAmount !== 0) {
            // Adjust pointer start positions by actual scroll delta so dragged card stays locked to cursor
            pointerStartYRef.current -= actualScrollAmount;
            subItemStartYRef.current -= actualScrollAmount;
          }

          // Re-evaluate section drag position with updated pointerStartYRef
          if (pointerDragIdxRef.current !== null) {
            const currentIdx = pointerDragIdxRef.current;
            const deltaY = clientY - pointerStartYRef.current;
            const threshold = 55;
            const list = sectionOrderArrayRef.current;

            if (deltaY > threshold) {
              if (currentIdx < list.length - 1) {
                const nextIdx = currentIdx + 1;
                const newArr = [...list];
                const [item] = newArr.splice(currentIdx, 1);
                newArr.splice(nextIdx, 0, item);

                sectionOrderArrayRef.current = newArr;
                pointerStartYRef.current = clientY;
                pointerDragIdxRef.current = nextIdx;

                setPointerDragIdx(nextIdx);
                setPointerOffsetY(0);
                setFormData((prev) => ({ ...prev, sectionOrder: newArr }));
              }
            } else if (deltaY < -threshold) {
              if (currentIdx > 0) {
                const nextIdx = currentIdx - 1;
                const newArr = [...list];
                const [item] = newArr.splice(currentIdx, 1);
                newArr.splice(nextIdx, 0, item);

                sectionOrderArrayRef.current = newArr;
                pointerStartYRef.current = clientY;
                pointerDragIdxRef.current = nextIdx;

                setPointerDragIdx(nextIdx);
                setPointerOffsetY(0);
                setFormData((prev) => ({ ...prev, sectionOrder: newArr }));
              }
            } else {
              setPointerOffsetY(deltaY);
            }
          }

          // Re-evaluate sub-item drag position with updated subItemStartYRef
          if (subItemDragKeyRef.current !== null && subItemDragIdxRef.current !== null) {
            const key = subItemDragKeyRef.current;
            const currentIdx = subItemDragIdxRef.current;
            const deltaY = clientY - subItemStartYRef.current;
            const threshold = 55;
            const list = subItemArrayRef.current;

            if (deltaY > threshold) {
              if (currentIdx < list.length - 1) {
                const nextIdx = currentIdx + 1;
                const newArr = [...list];
                const [item] = newArr.splice(currentIdx, 1);
                newArr.splice(nextIdx, 0, item);

                subItemArrayRef.current = newArr;
                subItemStartYRef.current = clientY;
                subItemDragIdxRef.current = nextIdx;

                setSubItemDragIdx(nextIdx);
                setSubItemOffsetY(0);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFormData((prev: any) => ({ ...prev, [key]: newArr }));
              }
            } else if (deltaY < -threshold) {
              if (currentIdx > 0) {
                const nextIdx = currentIdx - 1;
                const newArr = [...list];
                const [item] = newArr.splice(currentIdx, 1);
                newArr.splice(nextIdx, 0, item);

                subItemArrayRef.current = newArr;
                subItemStartYRef.current = clientY;
                subItemDragIdxRef.current = nextIdx;

                setSubItemDragIdx(nextIdx);
                setSubItemOffsetY(0);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFormData((prev: any) => ({ ...prev, [key]: newArr }));
              }
            } else {
              setSubItemOffsetY(deltaY);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(performAutoScroll);
    };

    animationFrameId = requestAnimationFrame(performAutoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pointerDragIdx !== null, subItemDragIdx !== null]);

  const handleSubItemPointerDown = (e: React.PointerEvent, secKey: string, index: number) => {
    if (e.button !== 0) return;
    const handleEl = e.currentTarget as HTMLElement;
    try { handleEl.setPointerCapture(e.pointerId); } catch {}

    // Synchronously copy section array into ref for zero-latency manipulation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentList = [...(((formData as any)[secKey] as any[]) || [])];
    subItemArrayRef.current = currentList;

    subItemDragKeyRef.current = secKey;
    subItemDragIdxRef.current = index;
    dragClientYRef.current = e.clientY;
    setSubItemDragKey(secKey);
    setSubItemDragIdx(index);
    subItemStartYRef.current = e.clientY;
    setSubItemOffsetY(0);
  };

  // Movement is now handled by the global window 'pointermove' listener (see useEffect below).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubItemPointerMove = (_e: React.PointerEvent, _secKey: string, _index: number) => {
    /* noop — window listener handles movement */
  };

  // Reset cleanup: fires when user releases pointer ANYWHERE
  const handleSubItemPointerUp = () => {
    subItemDragKeyRef.current = null;
    subItemDragIdxRef.current = null;
    subItemArrayRef.current = [];
    dragClientYRef.current = null;
    setSubItemDragKey(null);
    setSubItemDragIdx(null);
    setSubItemOffsetY(0);
  };

  // Global safety net: window-level listeners guarantee drag always ends even if
  // the grip handle element loses pointer capture after a React re-render/reorder.
  useEffect(() => {
    if (subItemDragIdx === null) return;

    const onWindowUp = () => {
      subItemDragKeyRef.current = null;
      subItemDragIdxRef.current = null;
      subItemArrayRef.current = [];
      dragClientYRef.current = null;
      setSubItemDragKey(null);
      setSubItemDragIdx(null);
      setSubItemOffsetY(0);
    };

    const onWindowMove = (e: PointerEvent) => {
      // 1. Safety check: If mouse primary button (left click) is not pressed, cancel drag immediately!
      if (e.buttons === 0) {
        onWindowUp();
        return;
      }

      dragClientYRef.current = e.clientY;

      const key = subItemDragKeyRef.current;
      const currentIdx = subItemDragIdxRef.current;
      if (key === null || currentIdx === null) return;

      const deltaY = e.clientY - subItemStartYRef.current;
      const threshold = 55;
      const list = subItemArrayRef.current;

      if (deltaY > threshold) {
        if (currentIdx < list.length - 1) {
          const nextIdx = currentIdx + 1;
          const newArr = [...list];
          const [item] = newArr.splice(currentIdx, 1);
          newArr.splice(nextIdx, 0, item);

          // SYNCHRONOUS REF UPDATES (immediate, zero latency):
          subItemArrayRef.current = newArr;
          subItemStartYRef.current = e.clientY;
          subItemDragIdxRef.current = nextIdx;

          // SYNCHRONOUS STATE UPDATES for visual rendering:
          setSubItemDragIdx(nextIdx);
          setSubItemOffsetY(0);

          // ASYNCHRONOUS DATA UPDATE:
          setFormData((prev) => ({ ...prev, [key]: newArr }));
        }
      } else if (deltaY < -threshold) {
        if (currentIdx > 0) {
          const nextIdx = currentIdx - 1;
          const newArr = [...list];
          const [item] = newArr.splice(currentIdx, 1);
          newArr.splice(nextIdx, 0, item);

          // SYNCHRONOUS REF UPDATES (immediate, zero latency):
          subItemArrayRef.current = newArr;
          subItemStartYRef.current = e.clientY;
          subItemDragIdxRef.current = nextIdx;

          // SYNCHRONOUS STATE UPDATES for visual rendering:
          setSubItemDragIdx(nextIdx);
          setSubItemOffsetY(0);

          // ASYNCHRONOUS DATA UPDATE:
          setFormData((prev) => ({ ...prev, [key]: newArr }));
        }
      } else {
        setSubItemOffsetY(deltaY);
      }
    };

    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointercancel', onWindowUp);
    window.addEventListener('blur', onWindowUp);
    return () => {
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointercancel', onWindowUp);
      window.removeEventListener('blur', onWindowUp);
    };
  // Re-register whenever drag starts (idx changes from null → number)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subItemDragIdx === null]);

  // Auto-save CV data to local storage when data or styles change
  useEffect(() => {
    if (!isMounted || (viewMode !== 'create' && !cvId)) return;

    const currentSnapshot = JSON.stringify({
      formData,
      titleInput,
      selectedTemplateId,
      docFontFamily,
      docFontSize,
      docSpacing,
      docShowIcons,
      docNameSize,
      docHeaderSize,
      docBodySize,
      docSectionSpacing,
      docLineHeight,
      docLetterSpacing,
      docLinkStyle,
      docMarginPreset,
      docMarginTop,
      docMarginBottom,
      docMarginLeft,
      docMarginRight,
    });

    // Set initial snapshot on first load without saving
    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = currentSnapshot;
      return;
    }

    // Skip auto-save if no data changed
    if (currentSnapshot === lastSavedSnapshotRef.current) return;

    // Debounce timer: 400ms idle before saving to local storage
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
        docFontFamily,
        docFontSize,
        docSpacing,
        docShowIcons,
        docNameSize,
        docHeaderSize,
        docBodySize,
        docSectionSpacing,
        docLineHeight,
        docLetterSpacing,
        docLinkStyle,
        docMarginPreset,
        docMarginTop,
        docMarginBottom,
        docMarginLeft,
        docMarginRight,
      } as CVData;

      setCvList((prevList) => {
        let updatedList = [...prevList];
        const existingIdx = prevList.findIndex((cv) => cv.id === targetId);
        if (existingIdx >= 0) {
          updatedList[existingIdx] = updatedCV;
        } else {
          updatedList = [updatedCV, ...prevList];
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
          localStorage.setItem('cuti_cv_active_draft', JSON.stringify(updatedCV));
          localStorage.setItem(`cuti_cv_data_${targetId}`, JSON.stringify(updatedCV));
        }
        return updatedList;
      });

      lastSavedSnapshotRef.current = currentSnapshot;
    }, 400);

    return () => clearTimeout(timer);
  }, [
    formData,
    titleInput,
    selectedTemplateId,
    cvId,
    viewMode,
    isMounted,
    selectedCV,
    docFontFamily,
    docFontSize,
    docSpacing,
    docShowIcons,
    docNameSize,
    docHeaderSize,
    docBodySize,
    docSectionSpacing,
    docLineHeight,
    docLetterSpacing,
    docLinkStyle,
    docMarginPreset,
    docMarginTop,
    docMarginBottom,
    docMarginLeft,
    docMarginRight,
  ]);

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
    const targetId = cvId && cvId !== 'create' ? cvId : `cv-${Date.now()}`;
    const calculatedScore = selectedCV ? selectedCV.atsScore : 85 + (cvList.length % 8);

    const updatedCV: CVData = {
      ...(selectedCV || {}),
      ...formData,
      id: targetId,
      title: titleInput || 'CV Tanpa Judul',
      updatedAt: 'Hari ini',
      atsScore: calculatedScore,
      templateId: selectedTemplateId,
      docFontFamily,
      docFontSize,
      docSpacing,
      docShowIcons,
      docNameSize,
      docHeaderSize,
      docBodySize,
      docSectionSpacing,
      docLineHeight,
      docLetterSpacing,
      docLinkStyle,
      docMarginPreset,
      docMarginTop,
      docMarginBottom,
      docMarginLeft,
      docMarginRight,
    } as CVData;

    const existingIdx = cvList.findIndex((cv) => cv.id === targetId);
    if (existingIdx >= 0) {
      updatedList[existingIdx] = updatedCV;
    } else {
      updatedList = [updatedCV, ...cvList];
    }

    setCvList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuti_cv_list', JSON.stringify(updatedList));
      localStorage.setItem('cuti_cv_active_draft', JSON.stringify(updatedCV));
      localStorage.setItem(`cuti_cv_data_${targetId}`, JSON.stringify(updatedCV));
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

  const handleOpenCvDetail = (cv: CVData) => {
    setSelectedCV(cv);
    setTitleInput(cv.title);
    setFormData({
      firstName: cv.firstName || '',
      lastName: cv.lastName || '',
      fullName: cv.fullName || '',
      headline: cv.headline || '',
      photoUrl: cv.photoUrl || '',
      email: cv.email || '',
      phone: cv.phone || '',
      website: cv.website || '',
      linkedin: cv.linkedin || '',
      github: cv.github || '',
      city: cv.city || '',
      province: cv.province || '',
      country: cv.country || '',
      location: cv.location || '',
      summary: cv.summary || '',
      skills: cv.skills ? [...cv.skills] : [],
      skillsList: cv.skillsList ? [...cv.skillsList] : [],
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
    if (cv.templateId) setSelectedTemplateId(cv.templateId);
    if (cv.docFontFamily) setDocFontFamily(cv.docFontFamily);
    if (cv.docFontSize) setDocFontSize(cv.docFontSize);
    if (cv.docSpacing) setDocSpacing(cv.docSpacing);
    if (cv.docShowIcons !== undefined) setDocShowIcons(cv.docShowIcons);
    if (cv.docNameSize !== undefined) setDocNameSize(cv.docNameSize);
    if (cv.docHeaderSize !== undefined) setDocHeaderSize(cv.docHeaderSize);
    if (cv.docBodySize !== undefined) setDocBodySize(cv.docBodySize);
    if (cv.docSectionSpacing !== undefined) setDocSectionSpacing(cv.docSectionSpacing);
    if (cv.docLineHeight !== undefined) setDocLineHeight(cv.docLineHeight);
    if (cv.docLetterSpacing !== undefined) setDocLetterSpacing(cv.docLetterSpacing);
    if (cv.docLinkStyle) setDocLinkStyle(cv.docLinkStyle);
    if (cv.docMarginTop !== undefined) setDocMarginTop(cv.docMarginTop);
    if (cv.docMarginBottom !== undefined) setDocMarginBottom(cv.docMarginBottom);
    if (cv.docMarginLeft !== undefined) setDocMarginLeft(cv.docMarginLeft);
    if (cv.docMarginRight !== undefined) setDocMarginRight(cv.docMarginRight);

    setViewMode('preview');
    setIsFormDrawerOpen(true);
    router.push(`/cv/${cv.id}`);
  };

  const handleDeleteCV = (cv: CVData) => {
    setDeletingCvTarget(cv);
  };

  const handleConfirmDeleteCV = () => {
    if (!deletingCvTarget) return;
    const targetId = deletingCvTarget.id;
    const updated = cvList.filter((c) => c.id !== targetId);
    setCvList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuti_cv_list', JSON.stringify(updated));
      localStorage.removeItem(`cuti_cv_data_${targetId}`);
    }
    setDeletingCvTarget(null);
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
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0" suppressHydrationWarning>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div
                        onClick={() => handleOpenCvDetail(cv)}
                        className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/60 transition"
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3
                          onClick={() => handleOpenCvDetail(cv)}
                          className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-orange-500 dark:hover:text-orange-400 transition"
                        >
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
                      onClick={() => handleOpenCvDetail(cv)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat / Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCV(cv)}
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
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm">
                        <span>1. Data Diri &amp; Target Karir</span>
                        <button
                          type="button"
                          onClick={() => setDocShowIcons(!docShowIcons)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            docShowIcons
                              ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                          title="Klik untuk mengubah antara Tampilan Icon Kontak dan Teks Saja"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                          <span>{docShowIcons ? 'Icon Kontak: Aktif' : 'Icon Kontak: Teks Saja'}</span>
                        </button>
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
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold block">No HP / WhatsApp *</label>
                            {formData.phone && (
                              <a
                                href={getWaMeUrl(formData.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <span>Tes wa.me</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="+62 812-3456-7890"
                            value={formData.phone}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val && !val.startsWith('+62')) {
                                val = formatPhone62(val);
                              }
                              setFormData((prev) => ({ ...prev, phone: val }));
                            }}
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
        <div className="cv-print-area-wrapper flex flex-col space-y-4 max-w-7xl mx-auto w-full print:space-y-0 print:max-w-none print:w-[210mm] print:m-0 print:p-0">
          {/* CONTROL TOOLBAR FOR LAYOUT & DOCUMENT SETTINGS */}
          <div className="w-full bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs no-print">
            {/* Left: Back to List & Active Layout Indicator */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Tata Letak:</span>
                <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800/60 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-orange-500" />
                  <span>{cvTemplates.find((t) => t.id === selectedTemplateId)?.name || 'ATS Standard'}</span>
                </span>
              </div>
            </div>

            {/* Right: ATS Score Indicator Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Skor ATS: {selectedCV?.atsScore ?? 95}%</span>
              </span>
            </div>
          </div>

          {/* MAIN CONTENT: SPLIT SCREEN ON DESKTOP (LEFT: A4 CANVAS, RIGHT: INLINE FORM EDITOR) */}
          <div className="cv-print-area-wrapper grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:w-[210mm] print:m-0 print:p-0">
            {/* LEFT COLUMN: CENTERED A4 CANVAS PREVIEW */}
            <div className="cv-print-area-wrapper lg:col-span-7 xl:col-span-7 w-full overflow-x-auto no-scrollbar pb-4 flex justify-center bg-slate-200/60 dark:bg-slate-950/80 p-4 md:p-6 rounded-xl border border-slate-300/60 dark:border-slate-800 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto print:p-0 print:bg-transparent print:border-none print:max-h-none print:overflow-visible print:static print:block print:w-[210mm] print:m-0">
              <A4PaperlikeCanvas
                templateId={selectedTemplateId}
                customData={formData}
                docFontFamily={docFontFamily}
                docFontSize={docFontSize}
                docSpacing={docSpacing}
                docShowIcons={docShowIcons}
                docPhotoPosition={docPhotoPosition}
                docNameSize={docNameSize}
                docHeaderSize={docHeaderSize}
                docBodySize={docBodySize}
                docSectionSpacing={docSectionSpacing}
                docLineHeight={docLineHeight}
                docLetterSpacing={docLetterSpacing}
                docLinkStyle={docLinkStyle}
                docProjectLinkStyle={docProjectLinkStyle}
                docRefEmailHyperlink={docRefEmailHyperlink}
                docRefPhoneHyperlink={docRefPhoneHyperlink}
                docMarginTop={docMarginTop}
                docMarginBottom={docMarginBottom}
                docMarginLeft={docMarginLeft}
                docMarginRight={docMarginRight}
              />
            </div>

            {/* RIGHT COLUMN: TOGGLE TABS (EDITOR | TEMPLATES | PENGATURAN) */}
            <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col space-y-3 no-print">
              {/* Header Navigation Toggle Bar */}
              <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('editor')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === 'editor'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('templates')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === 'templates'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Templates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('pengaturan')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === 'pengaturan'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Pengaturan</span>
                </button>
              </div>

              {/* TAB 1: EDITOR */}
              {rightPanelTab === 'editor' && (
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
                              onChange={(e) => {
                                let val = e.target.value;
                                if (val && !val.startsWith('+62')) {
                                  val = formatPhone62(val);
                                }
                                setFormData((prev) => ({ ...prev, phone: val }));
                              }}
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

                        {/* Media Sosial Optional Dropdown & Input */}
                        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                            Media Sosial Tambahan (Opsional)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <select
                                value={formData.socialPlatform || 'github'}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    socialPlatform: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 transition shadow-2xs"
                              >
                                <option value="github">GitHub</option>
                                <option value="dribbble">Dribbble</option>
                                <option value="instagram">Instagram</option>
                                <option value="twitter">Twitter / X</option>
                                <option value="youtube">YouTube</option>
                                <option value="facebook">Facebook</option>
                                <option value="pinterest">Pinterest</option>
                                <option value="tiktok">TikTok</option>
                                <option value="website">Portofolio / Website</option>
                                <option value="other">Lainnya</option>
                              </select>
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder={
                                  formData.socialPlatform === 'dribbble'
                                    ? 'e.g., dribbble.com/johndoe'
                                    : formData.socialPlatform === 'instagram'
                                    ? 'e.g., instagram.com/johndoe'
                                    : formData.socialPlatform === 'twitter'
                                    ? 'e.g., x.com/johndoe'
                                    : formData.socialPlatform === 'youtube'
                                    ? 'e.g., youtube.com/@johndoe'
                                    : formData.socialPlatform === 'facebook'
                                    ? 'e.g., facebook.com/johndoe'
                                    : formData.socialPlatform === 'pinterest'
                                    ? 'e.g., pinterest.com/johndoe'
                                    : formData.socialPlatform === 'tiktok'
                                    ? 'e.g., tiktok.com/@johndoe'
                                    : formData.socialPlatform === 'website'
                                    ? 'e.g., johndoe.dev'
                                    : 'e.g., github.com/johndoe'
                                }
                                value={formData.github || formData.socialHandle || ''}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    github: e.target.value,
                                    socialHandle: e.target.value,
                                  }))
                                }
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Foto Profil Upload Canvas WebP & Preview (Opsional) */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                            Foto Profil (Opsional)
                          </label>
                          <input
                            type="file"
                            ref={photoFileInputRef}
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          {formData.photoUrl ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={formData.photoUrl}
                                  alt="Profil"
                                  className={`w-14 h-14 ${formData.photoShape === 'square' ? 'rounded-lg' : 'rounded-full'} object-cover border-2 border-orange-500 shadow-2xs shrink-0 bg-white`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Foto Profil Terpasang</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500 font-semibold">Bentuk:</span>
                                      <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, photoShape: 'circle' }))}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                          (formData.photoShape || 'circle') === 'circle'
                                            ? 'bg-orange-500 text-white shadow-2xs'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                        }`}
                                      >
                                        Lingkaran
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, photoShape: 'square' }))}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                          formData.photoShape === 'square'
                                            ? 'bg-orange-500 text-white shadow-2xs'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                        }`}
                                      >
                                        Persegi
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-slate-500 font-semibold">Posisi:</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({ ...prev, photoPosition: 'left' }));
                                          setDocPhotoPosition('left');
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                          (formData.photoPosition || docPhotoPosition || 'right') === 'left'
                                            ? 'bg-orange-500 text-white shadow-2xs'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                        }`}
                                      >
                                        Kiri
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({ ...prev, photoPosition: 'right' }));
                                          setDocPhotoPosition('right');
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                          (formData.photoPosition || docPhotoPosition || 'right') === 'right'
                                            ? 'bg-orange-500 text-white shadow-2xs'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                        }`}
                                      >
                                        Kanan
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={handleEditExistingPhoto}
                                  className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-400 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                  title="Atur Ukuran & Posisi Foto"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>Atur Ukuran</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => photoFileInputRef.current?.click()}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold transition cursor-pointer"
                                >
                                  Ganti
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => photoFileInputRef.current?.click()}
                                className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-2"
                              >
                                <Upload className="w-4 h-4 text-orange-500" />
                                <span>Unggah Foto Profil</span>
                              </button>
                              <span className="text-[11px] text-slate-400">PNG, JPG, WebP</span>
                            </div>
                          )}
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                              Ringkasan Profil / Summary
                            </label>
                            <button
                              type="button"
                              onClick={() => handleOpenAiDrawer('summary', 'Ringkasan Profesional', formData.summary, (newVal, feedback) => {
                                setFormData((prev) => ({ ...prev, summary: newVal }));
                                handleAiSuccessFeedback(feedback);
                              })}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800 transition cursor-pointer shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                              <span>Bantu tulis dengan AI</span>
                            </button>
                          </div>
                          <AutoResizeTextarea
                            placeholder="e.g., Senior frontend engineer dengan 8+ tahun pengalaman..."
                            value={formData.summary}
                            onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                          />
                        </div>
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

                            const isDraggingThis = subItemDragKey === 'experience' && subItemDragIdx === expIdx;

                            return (
                              <div
                                key={exp.id || expIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'experience', expIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'experience', expIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                      Pengalaman Kerja #{expIdx + 1}
                                    </span>

                                  </div>
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

                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Lokasi Perusahaan</label>
                                  <CitySearchInput
                                    value={exp.location || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[expIdx] = { ...arr[expIdx], location: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                  />
                                </div>

                                 <div className="grid grid-cols-2 gap-3">
                                   <div>
                                     <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Mulai Bekerja</label>
                                     <CustomDatePicker
                                       value={exp.startDate || ''}
                                       onChange={(val) => {
                                         setFormData((prev) => {
                                           const arr = [...prev.experience];
                                           arr[expIdx] = { ...arr[expIdx], startDate: val };
                                           return { ...prev, experience: arr };
                                         });
                                       }}
                                       placeholder="Mulai..."
                                     />
                                   </div>
                                   <div>
                                     <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Selesai Bekerja</label>
                                     <CustomDatePicker
                                       disabled={exp.isCurrent}
                                       value={exp.isCurrent ? 'Sekarang' : (exp.endDate || '')}
                                       minDate={exp.startDate || ''}
                                       onChange={(val) => {
                                         setFormData((prev) => {
                                           const arr = [...prev.experience];
                                           arr[expIdx] = {
                                             ...arr[expIdx],
                                             endDate: val,
                                             isCurrent: val === 'Sekarang' || val === 'Saat Ini',
                                           };
                                           return { ...prev, experience: arr };
                                         });
                                       }}
                                       placeholder="Selesai..."
                                       allowPresent={true}
                                     />
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
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                                      Deskripsi Tugas &amp; Pencapaian
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAiDrawer('experience', `Pengalaman (${exp.role || 'Kerja'})`, exp.description, (newVal, feedback) => {
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], description: newVal };
                                          return { ...prev, experience: arr };
                                        });
                                        handleAiSuccessFeedback(feedback);
                                      })}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800 transition cursor-pointer shadow-2xs"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                                      <span>Bantu tulis dengan AI</span>
                                    </button>
                                  </div>

                                  <BulletPointListInput
                                    placeholder="e.g., Memimpin tim frontend 5 orang, mengoptimalkan waktu muat aplikasi hingga 40%..."
                                    value={exp.description}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.experience];
                                        arr[expIdx] = { ...arr[expIdx], description: val };
                                        return { ...prev, experience: arr };
                                      });
                                    }}
                                    onOptimizeBullet={(bulletText, bulletIdx) => {
                                      handleOpenBulletPopover(bulletText, (newVal, feedback) => {
                                        const lines = exp.description ? exp.description.split('\n') : [];
                                        lines[bulletIdx] = newVal;
                                        const updatedStr = lines.join('\n');
                                        setFormData((prev) => {
                                          const arr = [...prev.experience];
                                          arr[expIdx] = { ...arr[expIdx], description: updatedStr };
                                          return { ...prev, experience: arr };
                                        });
                                        handleAiSuccessFeedback(feedback);
                                      });
                                    }}
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
                          {(formData.internships || []).map((item, itemIdx) => {
                            const isDraggingThis = subItemDragKey === 'internships' && subItemDragIdx === itemIdx;

                            return (
                              <div
                                key={item.id || itemIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'internships', itemIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'internships', itemIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                      Magang #{itemIdx + 1}
                                    </span>

                                  </div>
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

                              <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Lokasi Perusahaan</label>
                                <CitySearchInput
                                  value={item.location || ''}
                                  onChange={(val) => {
                                    setFormData((prev) => {
                                      const arr = [...(prev.internships || [])];
                                      arr[itemIdx] = { ...arr[itemIdx], location: val };
                                      return { ...prev, internships: arr };
                                    });
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Mulai</label>
                                  <CustomDatePicker
                                    value={item.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], startDate: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    placeholder="Mulai..."
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Selesai</label>
                                  <CustomDatePicker
                                    value={item.endDate || ''}
                                    minDate={item.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.internships || [])];
                                        arr[itemIdx] = { ...arr[itemIdx], endDate: val };
                                        return { ...prev, internships: arr };
                                      });
                                    }}
                                    placeholder="Selesai..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>

                              <BulletPointListInput
                                label="Deskripsi Tugas Magang"
                                placeholder="e.g., Membantu tim merancang wireframe dan mendesain 10+ komponen UI..."
                                value={item.description}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.internships || [])];
                                    arr[itemIdx] = { ...arr[itemIdx], description: val };
                                    return { ...prev, internships: arr };
                                  });
                                }}
                              />
                            </div>
                          );
                          })}

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
                          {(formData.projects || []).map((proj, projIdx) => {
                            const isDraggingThis = subItemDragKey === 'projects' && subItemDragIdx === projIdx;

                            return (
                              <div
                                key={proj.id || projIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'projects', projIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'projects', projIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                      Proyek #{projIdx + 1}
                                    </span>

                                  </div>
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

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Teknologi yang Digunakan</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., React, Node.js, TailwindCSS"
                                    value={proj.tech || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], tech: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">URL / Link Proyek</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., https://github.com/user/project"
                                    value={proj.url || proj.link || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], url: val, link: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Mulai Proyek</label>
                                  <CustomDatePicker
                                    value={proj.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], startDate: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    placeholder="Mulai..."
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Selesai Proyek</label>
                                  <CustomDatePicker
                                    value={proj.endDate || ''}
                                    minDate={proj.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.projects || [])];
                                        arr[projIdx] = { ...arr[projIdx], endDate: val };
                                        return { ...prev, projects: arr };
                                      });
                                    }}
                                    placeholder="Selesai..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>

                              <BulletPointListInput
                                label="Deskripsi Proyek & Hasil"
                                placeholder="e.g., Membangun aplikasi toko online dengan fitur payment gateway..."
                                value={proj.description}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.projects || [])];
                                    arr[projIdx] = { ...arr[projIdx], description: val };
                                    return { ...prev, projects: arr };
                                  });
                                }}
                              />
                            </div>
                          );
                          })}

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
                                    tech: '',
                                    url: '',
                                    link: '',
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
                            <span>Tambah Proyek</span>
                          </button>
                        </div>
                      );
                    } else if (secKey === 'organizations') {
                      title = 'Pengalaman Organisasi';
                      accordionKey = 'sec6';
                      content = (
                        <div className="space-y-4">
                          {(formData.organizations || []).map((org, orgIdx) => {
                            const isDraggingThis = subItemDragKey === 'organizations' && subItemDragIdx === orgIdx;

                            return (
                              <div
                                key={org.id || orgIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'organizations', orgIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'organizations', orgIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                      Organisasi #{orgIdx + 1}
                                    </span>

                                  </div>
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
                                  <CustomDatePicker
                                    value={org.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], startDate: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    placeholder="Mulai..."
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Selesai</label>
                                  <CustomDatePicker
                                    value={org.endDate || ''}
                                    minDate={org.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.organizations || [])];
                                        arr[orgIdx] = { ...arr[orgIdx], endDate: val };
                                        return { ...prev, organizations: arr };
                                      });
                                    }}
                                    placeholder="Selesai..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>

                              <BulletPointListInput
                                label="Deskripsi Kegiatan & Peran"
                                placeholder="e.g., Mengkoordinasikan seminar teknologi nasional dengan 500+ peserta..."
                                value={org.description}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.organizations || [])];
                                    arr[orgIdx] = { ...arr[orgIdx], description: val };
                                    return { ...prev, organizations: arr };
                                  });
                                }}
                              />
                            </div>
                          );
                          })}

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
                          {formData.education.map((edu, eduIdx) => {
                            const isDraggingThis = subItemDragKey === 'education' && subItemDragIdx === eduIdx;

                            return (
                              <div
                                key={edu.id || eduIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'education', eduIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'education', eduIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                      Pendidikan #{eduIdx + 1}
                                    </span>

                                  </div>
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
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Masuk</label>
                                  <CustomDatePicker
                                    value={edu.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], startDate: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    placeholder="Tahun masuk..."
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Lulus</label>
                                  <CustomDatePicker
                                    value={edu.endDate || ''}
                                    minDate={edu.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...prev.education];
                                        arr[eduIdx] = { ...arr[eduIdx], endDate: val };
                                        return { ...prev, education: arr };
                                      });
                                    }}
                                    placeholder="Tahun lulus..."
                                    allowPresent={true}
                                  />
                                </div>
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

                              <BulletPointListInput
                                label="Deskripsi / Prestasi Akademik"
                                placeholder="e.g., Ketua BEM, Asisten Dosen, Penelitian Tugas Akhir tentang..."
                                value={edu.description || ''}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...prev.education];
                                    arr[eduIdx] = { ...arr[eduIdx], description: val };
                                    return { ...prev, education: arr };
                                  });
                                }}
                              />
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
                                    startDate: '',
                                    endDate: '',
                                    gpa: '',
                                    description: '',
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
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Credential ID</label>
                                <input
                                  type="text"
                                  placeholder="e.g., ABC123XYZ atau kode unik dari penerbit"
                                  value={cert.credentialId || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData((prev) => {
                                      const arr = [...(prev.certifications || [])];
                                      arr[certIdx] = { ...arr[certIdx], credentialId: val };
                                      return { ...prev, certifications: arr };
                                    });
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-2xs"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Tanggal Terbit</label>
                                  <CustomDatePicker
                                    value={cert.issueDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.certifications || [])];
                                        arr[certIdx] = { ...arr[certIdx], issueDate: val };
                                        return { ...prev, certifications: arr };
                                      });
                                    }}
                                    placeholder="Tanggal Terbit..."
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-xs">Link / URL Sertifikat</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., https://credential.net/123"
                                    value={cert.link || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const arr = [...(prev.certifications || [])];
                                        arr[certIdx] = { ...arr[certIdx], link: val };
                                        return { ...prev, certifications: arr };
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
                        <SkillsEditorSection
                          skills={formData.skills}
                          onChange={(newSkills) => setFormData((prev) => ({ ...prev, skills: newSkills }))}
                        />
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
                                <CustomSelect
                                  value={lang.level}
                                  onChange={(val) => {
                                    setFormData((prev) => {
                                      const arr = [...(prev.languages || [])];
                                      arr[langIdx] = { ...arr[langIdx], level: val as any };
                                      return { ...prev, languages: arr };
                                    });
                                  }}
                                  options={[
                                    { value: 'Native', label: 'Native (Penutur Asli)' },
                                    { value: 'Professional', label: 'Professional (Lancar)' },
                                    { value: 'Conversational', label: 'Conversational (Menengah)' },
                                    { value: 'Basic', label: 'Basic (Dasar)' },
                                  ]}
                                />
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
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</label>
                                  <CustomDatePicker
                                    value={crs.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.courses || [])];
                                        arr[crsIdx] = { ...arr[crsIdx], startDate: val };
                                        return { ...prev, courses: arr };
                                      });
                                    }}
                                    placeholder="Mulai..."
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</label>
                                  <CustomDatePicker
                                    value={crs.endDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.courses || [])];
                                        arr[crsIdx] = { ...arr[crsIdx], endDate: val };
                                        return { ...prev, courses: arr };
                                      });
                                    }}
                                    placeholder="Selesai..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>
                              <BulletPointListInput
                                label="Deskripsi & Pelaksanaan Pelatihan"
                                placeholder="Tuliskan materi utama, proyek yang diselesaikan..."
                                value={crs.description || ''}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.courses || [])];
                                    arr[crsIdx] = { ...arr[crsIdx], description: val };
                                    return { ...prev, courses: arr };
                                  });
                                }}
                              />
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
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</label>
                                  <CustomDatePicker
                                    value={sch.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.scholarships || [])];
                                        arr[schIdx] = { ...arr[schIdx], startDate: val };
                                        return { ...prev, scholarships: arr };
                                      });
                                    }}
                                    placeholder="Mulai Beasiswa..."
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</label>
                                  <CustomDatePicker
                                    value={sch.endDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.scholarships || [])];
                                        arr[schIdx] = { ...arr[schIdx], endDate: val };
                                        return { ...prev, scholarships: arr };
                                      });
                                    }}
                                    placeholder="Selesai Beasiswa..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>
                              <BulletPointListInput
                                label="Deskripsi & Pencapaian Beasiswa"
                                placeholder="Tuliskan cakupan beasiswa, prestasi yang diraih, dan kontribusi..."
                                value={sch.description || ''}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.scholarships || [])];
                                    arr[schIdx] = { ...arr[schIdx], description: val };
                                    return { ...prev, scholarships: arr };
                                  });
                                }}
                              />
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
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Organisasi / Komunitas</label>
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
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Peran Relawan</label>
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
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</label>
                                  <CustomDatePicker
                                    value={vol.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[volIdx] = { ...arr[volIdx], startDate: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    placeholder="Mulai..."
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</label>
                                  <CustomDatePicker
                                    value={vol.endDate || ''}
                                    minDate={vol.startDate || ''}
                                    onChange={(val) => {
                                      setFormData((prev) => {
                                        const arr = [...(prev.volunteers || [])];
                                        arr[volIdx] = { ...arr[volIdx], endDate: val };
                                        return { ...prev, volunteers: arr };
                                      });
                                    }}
                                    placeholder="Selesai / Masih Aktif..."
                                    allowPresent={true}
                                  />
                                </div>
                              </div>
                              <BulletPointListInput
                                label="Deskripsi Kegiatan Relawan"
                                placeholder="Tuliskan peran, tanggung jawab, dan dampak kegiatan sosial..."
                                value={vol.description || ''}
                                onChange={(val) => {
                                  setFormData((prev) => {
                                    const arr = [...(prev.volunteers || [])];
                                    arr[volIdx] = { ...arr[volIdx], description: val };
                                    return { ...prev, volunteers: arr };
                                  });
                                }}
                              />
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

                          {(formData.references || []).map((ref, refIdx) => {
                            const isDraggingThis = subItemDragKey === 'references' && subItemDragIdx === refIdx;

                            return (
                              <div
                                key={ref.id || refIdx}
                                style={{
                                  transform: isDraggingThis ? `translateY(${subItemOffsetY}px) scale(1.02)` : undefined,
                                  zIndex: isDraggingThis ? 50 : undefined,
                                  transition: isDraggingThis ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                }}
                                className={`border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 transition-all duration-200 relative ${
                                  isDraggingThis
                                    ? 'shadow-2xl border-2 border-orange-500 ring-4 ring-orange-500/25 opacity-100 z-50 cursor-grabbing'
                                    : 'border-slate-200 dark:border-slate-800 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onPointerDown={(e) => handleSubItemPointerDown(e, 'references', refIdx)}
                                      onPointerMove={(e) => handleSubItemPointerMove(e, 'references', refIdx)}
                                      onPointerUp={handleSubItemPointerUp}
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 cursor-grab active:cursor-grabbing touch-none select-none"
                                      title="Tarik untuk mengatur posisi"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">Referensi #{refIdx + 1}</span>

                                  </div>
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
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
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
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Perusahaan / Institusi</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., PT Tekno Nusantara"
                                      value={ref.company || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...(prev.references || [])];
                                          arr[refIdx] = { ...arr[refIdx], company: val };
                                          return { ...prev, references: arr };
                                        });
                                      }}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Kontak</label>
                                    <input
                                      type="email"
                                      placeholder="john.smith@tekno.co.id"
                                      value={ref.email || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...(prev.references || [])];
                                          arr[refIdx] = { ...arr[refIdx], email: val };
                                          return { ...prev, references: arr };
                                        });
                                      }}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. HP / WhatsApp</label>
                                    <input
                                      type="text"
                                      placeholder="+62 812-3456-7890"
                                      value={ref.phone || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const arr = [...(prev.references || [])];
                                          arr[refIdx] = { ...arr[refIdx], phone: val };
                                          return { ...prev, references: arr };
                                        });
                                      }}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}

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
                        onPointerDown={(e) => handlePointerDown(e, idx)}
                        onPointerMove={(e) => handlePointerMove(e, idx)}
                        onPointerUp={handlePointerUp}
                        isPointerDragging={pointerDragIdx === idx}
                        dragOffsetY={pointerDragIdx === idx ? pointerOffsetY : 0}
                      >
                        {content}
                      </CVSectionCard>
                    );
                  })}
                </form>
              </div>
              )}

              {/* TAB 2: TEMPLATES */}
              {rightPanelTab === 'templates' && (
                <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Pilih Template &amp; Tata Letak CV ATS
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Klik preview kecil untuk memilih tata letak yang diinginkan. Semua template 100% aman untuk parser sistem ATS.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cvTemplates
                      .filter((tpl) => !tpl.hidden)
                      .map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setSelectedTemplateId(tpl.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer group text-left ${
                              isSelected
                                ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-orange-300 dark:hover:border-orange-600'
                            }`}
                          >
                            <div className="w-full aspect-[210/297] rounded-lg bg-white border border-slate-200 dark:border-slate-700 p-1 overflow-hidden shadow-2xs relative flex flex-col justify-between mb-2 group-hover:shadow-md transition">
                              <TemplateThumbnailVisual templateId={tpl.id} customData={formData} />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 block truncate">
                                {tpl.badge}
                              </span>
                              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                {tpl.name}
                              </h5>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 3: PENGATURAN */}
              {rightPanelTab === 'pengaturan' && (
                <div className="w-full bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs animate-in fade-in duration-150">
                  {/* SECTION 1: PENGATURAN MARGIN HALAMAN (WORD PRESET) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-orange-500" />
                        <span>Margin &amp; Layout Halaman</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleResetDocStyles}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Reset ke Gaya Default"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                        <span>Reset Default</span>
                      </button>
                    </div>

                    {/* Preset Buttons Grid (Normal, Narrow, Moderate, Wide, Mirrored) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Preset Margin Halaman (Word Style)
                        </label>
                        <span className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 capitalize">
                          {docMarginPreset === 'custom' ? 'Kustom' : MARGIN_PRESETS[docMarginPreset]?.name || 'Normal'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(Object.keys(MARGIN_PRESETS) as Array<keyof typeof MARGIN_PRESETS>).map((key) => {
                          const item = MARGIN_PRESETS[key];
                          const isSelected = docMarginPreset === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSelectMarginPreset(key)}
                              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? 'bg-orange-50/90 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20 shadow-2xs'
                                  : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-xs font-extrabold ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-slate-900 dark:text-white'}`}>
                                  {item.name}
                                </span>
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                <span>{item.labels.top}</span>
                                <span>{item.labels.bottom}</span>
                                <span>{item.labels.left}</span>
                                <span>{item.labels.right}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Margin Numeric Inputs */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Kustom Ukuran Margin (cm):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Atas</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="6"
                            value={docMarginTop}
                            onChange={(e) => handleCustomMarginChange('top', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Bawah</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="6"
                            value={docMarginBottom}
                            onChange={(e) => handleCustomMarginChange('bottom', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Kiri</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="6"
                            value={docMarginLeft}
                            onChange={(e) => handleCustomMarginChange('left', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Kanan</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="6"
                            value={docMarginRight}
                            onChange={(e) => handleCustomMarginChange('right', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: PENGATURAN GAYA DOKUMEN & TIPOGRAFI */}
                  <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                      <span>Ukuran Font &amp; Gaya Tipografi</span>
                    </h4>

                    {/* Skala Ukuran Font Global */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Skala Ukuran Font Dokumen (Global)
                        </label>
                        <span className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 uppercase">
                          {docFontSize}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'sm', label: 'Kecil', pct: '90%' },
                          { id: 'base', label: 'Normal', pct: '100%' },
                          { id: 'md', label: 'Sedang', pct: '108%' },
                          { id: 'lg', label: 'Besar', pct: '118%' },
                        ].map((fSize) => (
                          <button
                            key={fSize.id}
                            type="button"
                            onClick={() => setDocFontSize(fSize.id as any)}
                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                              docFontSize === fSize.id
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 shadow-2xs ring-1 ring-orange-500'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                            }`}
                          >
                            <span>{fSize.label}</span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{fSize.pct}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Toggle Icon Kontak */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Tampilan Icon Kontak
                        </label>
                        <button
                          type="button"
                          onClick={() => setDocShowIcons(!docShowIcons)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                            docShowIcons
                              ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-orange-500" />
                            <span>{docShowIcons ? 'Ikon Tampil' : 'Teks Saja'}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${docShowIcons ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                            {docShowIcons && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      </div>

                      {/* Selection Posisi Foto Profil Header */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                          <span>Posisi Foto Profil Header</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDocPhotoPosition('left');
                              setFormData((prev) => ({ ...prev, photoPosition: 'left' }));
                            }}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              docPhotoPosition === 'left'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                            <span>Di Kiri (Left)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDocPhotoPosition('right');
                              setFormData((prev) => ({ ...prev, photoPosition: 'right' }));
                            }}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              docPhotoPosition === 'right'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                            <span>Di Kanan (Right)</span>
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Font */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Jenis Font Utama
                        </label>
                        <select
                          value={docFontFamily}
                          onChange={(e) => setDocFontFamily(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="inter">Inter (Modern &amp; Clean)</option>
                          <option value="roboto">Roboto (Clean Sans)</option>
                          <option value="openSans">Open Sans (Neutral &amp; Friendly)</option>
                          <option value="googleSans">Google Sans (Modern Product)</option>
                          <option value="montserrat">Montserrat (Bold Editorial)</option>
                          <option value="lato">Lato (Warm &amp; Professional)</option>
                          <option value="sans">Geist / Inter (Default Sans)</option>
                          <option value="serif">EB Garamond / Lora (Serif Klasik)</option>
                          <option value="mono">JetBrains Mono (Monospace Tech)</option>
                          <option value="standard">Carlito / Arimo (ATS Standard)</option>
                        </select>
                      </div>

                      {/* Selection Gaya Hyperlink */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                          <span>Gaya Hyperlink / Tautan Kontak</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setDocLinkStyle('blue')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              docLinkStyle === 'blue'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span className="text-blue-600 dark:text-blue-400 underline font-semibold">Biru</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocLinkStyle('underline')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              docLinkStyle === 'underline'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span className="text-slate-900 dark:text-white underline font-semibold">Underline Hitam</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocLinkStyle('plain')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              docLinkStyle === 'plain'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                            }`}
                          >
                            <span className="text-slate-700 dark:text-slate-300 font-normal">Teks Biasa</span>
                          </button>
                      </div>

                      {/* Pengaturan Hyperlink Referensi */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-orange-500" />
                          <span>Hyperlink Referensi Kontak</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDocRefEmailHyperlink(!docRefEmailHyperlink)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                              docRefEmailHyperlink
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>Email (mailto:)</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${docRefEmailHyperlink ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {docRefEmailHyperlink && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocRefPhoneHyperlink(!docRefPhoneHyperlink)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                              docRefPhoneHyperlink
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>HP (wa.me)</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${docRefPhoneHyperlink ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {docRefPhoneHyperlink && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Pengaturan Format Link Proyek */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-orange-500" />
                          <span>Format Tampilan Link Proyek di CV</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setDocProjectLinkStyle('name')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                              docProjectLinkStyle === 'name'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Hyperlink Nama
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocProjectLinkStyle('text')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                              docProjectLinkStyle === 'text'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Teks Dokumentasi
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocProjectLinkStyle('none')}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                              docProjectLinkStyle === 'none'
                                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 dark:border-orange-600 shadow-2xs text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Sembunyikan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* 6 Sliders + Number Inputs */}
                    <div className="space-y-3.5 pt-2">
                      {/* 1. Ukuran Nama */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ukuran Nama</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docNameSize} px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={20}
                            max={44}
                            step={1}
                            value={docNameSize}
                            onChange={(e) => setDocNameSize(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={20}
                            max={44}
                            value={docNameSize}
                            onChange={(e) => setDocNameSize(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* 2. Ukuran Judul */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ukuran Judul (Section Header)</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docHeaderSize} px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={10}
                            max={24}
                            step={1}
                            value={docHeaderSize}
                            onChange={(e) => setDocHeaderSize(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={10}
                            max={24}
                            value={docHeaderSize}
                            onChange={(e) => setDocHeaderSize(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* 3. Ukuran Isi */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ukuran Isi (Teks Body)</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docBodySize} px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={8}
                            max={18}
                            step={1}
                            value={docBodySize}
                            onChange={(e) => setDocBodySize(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={8}
                            max={18}
                            value={docBodySize}
                            onChange={(e) => setDocBodySize(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* 4. Jarak Antar Bagian */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jarak Antar Bagian (Margin Seksi)</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docSectionSpacing} px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={8}
                            max={40}
                            step={1}
                            value={docSectionSpacing}
                            onChange={(e) => setDocSectionSpacing(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={8}
                            max={40}
                            value={docSectionSpacing}
                            onChange={(e) => setDocSectionSpacing(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* 5. Tinggi Baris */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tinggi Baris (Line Height)</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docLineHeight}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={1.0}
                            max={2.4}
                            step={0.1}
                            value={docLineHeight}
                            onChange={(e) => setDocLineHeight(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={1.0}
                            max={2.4}
                            step={0.1}
                            value={docLineHeight}
                            onChange={(e) => setDocLineHeight(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* 6. Jarak Antar Huruf */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jarak Antar Huruf (Letter Spacing)</label>
                          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{docLetterSpacing} px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={-1.0}
                            max={4.0}
                            step={0.1}
                            value={docLetterSpacing}
                            onChange={(e) => setDocLetterSpacing(Number(e.target.value))}
                            className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                          />
                          <input
                            type="number"
                            min={-1.0}
                            max={4.0}
                            step={0.1}
                            value={docLetterSpacing}
                            onChange={(e) => setDocLetterSpacing(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-extrabold text-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: FORMAT UNDUHAN & FORM NAMA DOKUMEN */}
                  <div className="space-y-3.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-orange-500" />
                      <span>Format Unduhan &amp; Nama Dokumen</span>
                    </h4>

                    {/* Form Nama Dokumen */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Nama File Dokumen CV
                      </label>
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="e.g. CV_Andi_Pratama_ATS"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Format Selector: PDF / DOCX */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Pilih Format File
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDownloadFormat('pdf')}
                          className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                            downloadFormat === 'pdf'
                              ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-rose-500" />
                          <span>PDF (.pdf)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDownloadFormat('docx')}
                          className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                            downloadFormat === 'docx'
                              ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Word (.docx)</span>
                        </button>
                      </div>
                    </div>

                    {/* INLINE CARD: CV DIBUATKAN HRD (SECONDARY CONVERSION BEFORE DOWNLOAD) */}
                    <div className="my-3.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-xs">
                      {/* Badge / Eyebrow */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-50 dark:bg-navy-950/80 text-navy-700 dark:text-navy-300 border border-navy-200/80 dark:border-navy-800 text-[11px] font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>CV Dibuatkan HRD</span>
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                          Review HRD &amp; ATS
                        </span>
                      </div>

                      {/* Headline & Description */}
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          Mau CV kamu lebih siap dilirik HRD?
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Biarkan HR profesional menyusun dan mengoptimalkan CV kamu agar lebih siap digunakan untuk melamar.
                        </p>
                      </div>

                      {/* Value & Action Button */}
                      <div className="pt-2.5 flex items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-700/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Layanan Professional
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-navy-700 dark:text-navy-300">
                            Mulai Rp79.000
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsHrdModalOpen(true)}
                          className="px-3.5 py-2 rounded-xl bg-navy-600 hover:bg-navy-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <span>Buatkan CV</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Button Unduh */}
                    <button
                      type="button"
                      onClick={handleDownloadCV}
                      className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh CV Saya ({downloadFormat.toUpperCase()})</span>
                    </button>
                  </div>

                  {/* SECTION 3: FITUR IMPORT FILE RESUME */}
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-orange-500" />
                      <span>Import File Resume / CV</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Unggah file resume kamu (.JSON, .PDF, atau .DOCX) untuk mengimpor data langsung ke dalam editor.
                    </p>

                    <label className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl bg-slate-50 dark:bg-slate-800/60 transition flex flex-col items-center justify-center gap-2 cursor-pointer group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 transition">
                        Pilih File Resume (JSON / PDF / DOCX)
                      </span>
                      <input
                        type="file"
                        accept=".json,.pdf,.docx,.txt"
                        onChange={handleImportResume}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCvTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingCvTarget(null);
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Icon & Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Hapus CV Ini?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apakah kamu yakin ingin menghapus CV{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    &quot;{deletingCvTarget.title || 'CV Tanpa Judul'}&quot;
                  </span>
                  ? Data yang dihapus dari local storage tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            {/* Target Card Highlight Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                  {deletingCvTarget.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Terakhir diubah: {deletingCvTarget.updatedAt || 'Hari ini'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                Skor ATS: {deletingCvTarget.atsScore ?? 85}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCvTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCV}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus CV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PILIH TEMPLATE CV MANDIRI & KONFIGURASI */}
      {showTemplateModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
              setTemplateModalStep(1);
            }
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
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
                            id={`template-card-${tpl.id}`}
                            onClick={() => setSelectedTemplateId(tpl.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-16 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-2xs bg-white">
                                <TemplateThumbnailVisual templateId={tpl.id} customData={formData} />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-block truncate">
                                  {tpl.badge}
                                </span>
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
                      onClick={handleSelectTemplateAndNext}
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateCvFromTemplate();
                              }
                            }}
                            placeholder="Contoh: CV Loker Software Engineer 2026"
                            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 transition ${
                              templateFormSubmitted && !isNewCvTitleValid
                                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 focus:ring-rose-500 focus:border-rose-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {templateFormSubmitted && !isNewCvTitleValid ? (
                            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Judul CV wajib diisi untuk melanjutkan.</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Nama untuk memudahkan kamu membedakan file CV di dashboard.
                            </p>
                          )}
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateCvFromTemplate();
                              }
                            }}
                            placeholder="Contoh: Senior Frontend Developer / Staff Administrasi"
                            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:ring-2 transition ${
                              templateFormSubmitted && !isNewCvJobTitleValid
                                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 focus:ring-rose-500 focus:border-rose-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {templateFormSubmitted && !isNewCvJobTitleValid ? (
                            <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Lowongan / Target Posisi wajib diisi untuk melanjutkan.</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Posisi pekerjaan spesifik yang menjadi target lamaran kamu.
                            </p>
                          )}
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
                                {templateFormSubmitted && !isNewCvFileValid && (
                                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>Wajib memilih file CV untuk diimpor.</span>
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
                    type="button"
                    onClick={() => setTemplateModalStep(1)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Templat</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {templateFormSubmitted && !isTemplateFormValid && (
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-4 h-4 shrink-0 animate-bounce text-rose-500" />
                        <span>Harap isi semua kolom wajib (*)</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateCvFromTemplate}
                      className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <span>Buat &amp; Edit CV</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* MODAL FOTO PROFIL: RESIZE & POSITION ADJUSTMENT */}
      {showPhotoCropModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPhotoCropModal(false);
            }
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-500" />
                  <span>Pengaturan &amp; Ukuran Foto Profil</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Posisikan bingkai cropper di atas foto sebelum disimpan (Maks. 2MB).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoCropModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Preview Canvas Circle */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                onMouseDown={(e) => {
                  setIsDraggingPhoto(true);
                  photoDragStartRef.current = { x: e.clientX - photoOffsetX, y: e.clientY - photoOffsetY };
                }}
                onMouseMove={(e) => {
                  if (isDraggingPhoto) {
                    setPhotoOffsetX(e.clientX - photoDragStartRef.current.x);
                    setPhotoOffsetY(e.clientY - photoDragStartRef.current.y);
                  }
                }}
                onMouseUp={() => setIsDraggingPhoto(false)}
                onMouseLeave={() => setIsDraggingPhoto(false)}
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    setIsDraggingPhoto(true);
                    photoDragStartRef.current = { x: e.touches[0].clientX - photoOffsetX, y: e.touches[0].clientY - photoOffsetY };
                  }
                }}
                onTouchMove={(e) => {
                  if (isDraggingPhoto && e.touches.length === 1) {
                    setPhotoOffsetX(e.touches[0].clientX - photoDragStartRef.current.x);
                    setPhotoOffsetY(e.touches[0].clientY - photoDragStartRef.current.y);
                  }
                }}
                onTouchEnd={() => setIsDraggingPhoto(false)}
                className="w-[280px] h-[280px] border-2 border-slate-700/80 rounded-2xl overflow-hidden relative shadow-inner bg-slate-950 cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
              >
                {/* Stationary Background Photo */}
                <img
                  src={rawPhotoDataUrl}
                  alt="Crop Preview"
                  draggable={false}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />

                {/* Movable Cropper Mask & Frame Overlay */}
                {(() => {
                  const baseCropSize = 160;
                  const cropSize = baseCropSize / photoScale;
                  const cx = 140 + photoOffsetX;
                  const cy = 140 + photoOffsetY;
                  const cropLeft = cx - cropSize / 2;
                  const cropTop = cy - cropSize / 2;

                  return (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none" viewBox="0 0 280 280">
                      <defs>
                        <mask id="cropper-mask-hole">
                          <rect x="0" y="0" width="280" height="280" fill="white" />
                          {photoShape === 'circle' ? (
                            <circle cx={cx} cy={cy} r={cropSize / 2} fill="black" />
                          ) : (
                            <rect x={cropLeft} y={cropTop} width={cropSize} height={cropSize} rx="16" fill="black" />
                          )}
                        </mask>
                      </defs>
                      {/* Darkened overlay outside the cropper frame */}
                      <rect x="0" y="0" width="280" height="280" fill="rgba(15, 23, 42, 0.65)" mask="url(#cropper-mask-hole)" />

                      {/* Moving Cropper Frame Border */}
                      {photoShape === 'circle' ? (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={cropSize / 2}
                          fill="none"
                          stroke="#F97316"
                          strokeWidth="3"
                          strokeDasharray="6 3"
                        />
                      ) : (
                        <rect
                          x={cropLeft}
                          y={cropTop}
                          width={cropSize}
                          height={cropSize}
                          rx="16"
                          fill="none"
                          stroke="#F97316"
                          strokeWidth="3"
                          strokeDasharray="6 3"
                        />
                      )}
                    </svg>
                  );
                })()}
              </div>
              {/* Zoom & Resize Slider Controls */}
              <div className="w-full max-w-[280px] space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400" /> Ukuran (Zoom)
                  </span>
                  <span className="font-mono text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                    {Math.round(photoScale * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoScale((prev) => Math.max(0.5, Math.round((prev - 0.1) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    title="Perkecil"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={photoScale}
                    onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoScale((prev) => Math.min(2.5, Math.round((prev + 0.1) * 100) / 100))}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    title="Perbesar"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Shape Switcher */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPhotoShape('circle')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    photoShape === 'circle' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
                  <span>Lingkaran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoShape('square')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    photoShape === 'square' ? 'bg-orange-500 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-xs border-2 border-current" />
                  <span>Persegi</span>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPhotoCropModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCroppedPhoto}
                className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
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

      {/* FLOATING CTA: CV DIBUATKAN HRD */}
      <CvHrdFloatingCta
        onSelectService={() => {
          setAiWizardStep(1);
          setViewMode('ai-wizard');
        }}
      />

      {/* MODAL: DETAIL LAYANAN CV DIBUATKAN HRD */}
      <CvHrdModal
        isOpen={isHrdModalOpen}
        onClose={() => setIsHrdModalOpen(false)}
        onSelectService={() => {
          setAiWizardStep(1);
          setViewMode('ai-wizard');
        }}
      />

      {/* Toast Feedback Success AI */}
      {aiToastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-white">Bullet berhasil diperbarui</div>
            <div className="text-[11px] text-slate-300">{aiToastMessage}</div>
          </div>
        </div>
      )}

      {/* Contextual AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        sectionKey={aiDrawerSectionKey}
        sectionTitle={aiDrawerSectionTitle}
        currentContent={aiDrawerContent}
        onApplyContent={(newVal, feedback) => {
          if (aiApplyHandler) aiApplyHandler(newVal, feedback);
        }}
        targetJobTitle={selectedCV?.headline || 'Professional'}
      />

      {/* Bullet Quick Action Rewrite Popover */}
      <BulletOptimizePopover
        isOpen={isBulletPopoverOpen}
        onClose={() => setIsBulletPopoverOpen(false)}
        bulletText={targetBulletText}
        onApplyRewrite={(newVal, feedback) => {
          if (bulletApplyHandler) bulletApplyHandler(newVal, feedback);
        }}
      />
    </div>
  );
};

// Mini Visual Thumbnail Preview Component for Template Selection Cards


// A4 Paperlike Canvas Component: Maintains exact A4 proportions per sheet, handles multi-page (Page 2+) flow with responsive auto-scaling & zoom controls
const A4PaperlikeCanvas: React.FC<{
  templateId: string;
  customData?: Partial<CVData>;
  showPageNumbers?: boolean;
  docFontFamily?: string;
  docFontSize?: string;
  docSpacing?: string;
  docShowIcons?: boolean;
  docPhotoPosition?: 'left' | 'right';
  docNameSize?: number;
  docHeaderSize?: number;
  docBodySize?: number;
  docSectionSpacing?: number;
  docLineHeight?: number;
  docLetterSpacing?: number;
  docLinkStyle?: 'blue' | 'underline' | 'plain';
  docProjectLinkStyle?: 'name' | 'text' | 'none';
  docRefEmailHyperlink?: boolean;
  docRefPhoneHyperlink?: boolean;
  docMarginTop?: number;
  docMarginBottom?: number;
  docMarginLeft?: number;
  docMarginRight?: number;
}> = ({
  templateId,
  customData,
  showPageNumbers = true,
  docFontFamily = 'sans',
  docFontSize = 'base',
  docSpacing = 'normal',
  docShowIcons = true,
  docPhotoPosition = 'right',
  docNameSize,
  docHeaderSize,
  docBodySize,
  docSectionSpacing,
  docLineHeight,
  docLetterSpacing,
  docLinkStyle = 'blue',
  docProjectLinkStyle = 'text',
  docRefEmailHyperlink = true,
  docRefPhoneHyperlink = true,
  docMarginTop = 1.27,
  docMarginBottom = 1.27,
  docMarginLeft = 1.27,
  docMarginRight = 1.27,
}) => {
  const hiddenMeasureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeightPx, setContentHeightPx] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number | null>(null);
  const [autoScale, setAutoScale] = useState<number>(1);

  useEffect(() => {
    const updateDimensions = () => {
      if (hiddenMeasureRef.current) {
        const measuredH = hiddenMeasureRef.current.scrollHeight;
        if (measuredH > 0) {
          setContentHeightPx(measuredH);
        }
      }
      if (containerRef.current) {
        const availW = containerRef.current.clientWidth - 24;
        const a4W = 794; // approx px width of 210mm (210 * 3.7795)
        if (availW > 0) {
          const computedScale = Number((availW / a4W).toFixed(3));
          // Clamped scale from 0.35x up to 2.0x for large 27"-32" screens
          const clampedScale = Math.min(Math.max(computedScale, 0.35), 2.0);
          setAutoScale(clampedScale);
        }
      }
    };

    updateDimensions();

    const ro = new ResizeObserver(updateDimensions);
    if (hiddenMeasureRef.current) ro.observe(hiddenMeasureRef.current);
    if (containerRef.current) ro.observe(containerRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [templateId, customData, docFontFamily, docFontSize, docSpacing, docShowIcons, docNameSize, docHeaderSize, docBodySize, docSectionSpacing, docLineHeight, docLetterSpacing, docLinkStyle, docProjectLinkStyle, docRefEmailHyperlink, docRefPhoneHyperlink, docMarginTop, docMarginBottom, docMarginLeft, docMarginRight]);

  const effectiveScale = zoomScale !== null ? zoomScale : autoScale;

  // Dynamic A4 margin & printable slice calculations
  const marginTopMM = (docMarginTop ?? 1.27) * 10;
  const marginBottomMM = (docMarginBottom ?? 1.27) * 10;
  const verticalMarginsMM = marginTopMM + marginBottomMM;
  const PRINTABLE_HEIGHT_MM = Math.max(100, 297 - verticalMarginsMM);

  const measuredHeightMM = contentHeightPx ? contentHeightPx * 0.26458333 : 250;
  const totalPages = Math.max(1, Math.ceil(measuredHeightMM / PRINTABLE_HEIGHT_MM));

  return (
    <div ref={containerRef} className="cv-print-area w-full max-w-full overflow-x-auto flex flex-col items-center gap-4 py-2 print:p-0 print:m-0 print:w-[210mm]">
      {/* Hidden DOM measurement container */}
      <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none print:hidden" aria-hidden="true">
        <div ref={hiddenMeasureRef} style={{ width: '210mm', background: '#ffffff' }}>
          <CVTemplatePreview
            templateId={templateId}
            customData={customData}
            docFontFamily={docFontFamily}
            docFontSize={docFontSize}
            docSpacing={docSpacing}
            docShowIcons={docShowIcons}
            docNameSize={docNameSize}
            docHeaderSize={docHeaderSize}
            docBodySize={docBodySize}
            docSectionSpacing={docSectionSpacing}
            docLineHeight={docLineHeight}
            docLetterSpacing={docLetterSpacing}
            docLinkStyle={docLinkStyle}
            docProjectLinkStyle={docProjectLinkStyle}
            docRefEmailHyperlink={docRefEmailHyperlink}
            docRefPhoneHyperlink={docRefPhoneHyperlink}
            docMarginTop={docMarginTop}
            docMarginBottom={docMarginBottom}
            docMarginLeft={docMarginLeft}
            docMarginRight={docMarginRight}
          />
        </div>
      </div>

      {/* Render Paginated A4 Paper Sheets with Responsive Scale Wrapper */}
      <div
        className="a4-paper-sheet-container flex flex-col items-center gap-6 transition-transform duration-200 origin-top print:gap-0 print:transform-none print:m-0"
        style={{
          transform: effectiveScale !== 1 ? `scale(${effectiveScale})` : undefined,
          marginBottom: effectiveScale !== 1 ? `${(effectiveScale - 1) * 297 * 3.7795 * totalPages}px` : undefined,
        }}
      >
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNum = index + 1;
          const translateYMM = index * PRINTABLE_HEIGHT_MM;

          return (
            <div key={pageNum} className="flex flex-col items-center w-full max-w-[210mm] print:w-[210mm] print:m-0 print:block print:p-0">
              {/* A4 Paperlike Sheet Card */}
              <div
                className="a4-paper-sheet relative bg-white text-slate-900 shadow-2xl shadow-slate-900/15 border border-slate-300/80 dark:border-slate-700/80 rounded-[2px] overflow-hidden transition-all duration-300 hover:shadow-slate-900/25 shrink-0 print:shadow-none print:border-none print:rounded-none print:m-0"
                style={{
                  width: '210mm',
                  height: '297mm',
                  boxSizing: 'border-box',
                }}
              >
                {/* Paper Texture Micro-Grain Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-multiply no-print"
                  style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Printable Page Inner Layout */}
                <div className="w-full h-full flex flex-col justify-between box-border">
                  {/* Page Top Margin Spacer */}
                  <div style={{ height: `${docMarginTop ?? 1.27}cm`, width: '100%', flexShrink: 0 }} />

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
                      <CVTemplatePreview
                        templateId={templateId}
                        customData={customData}
                        docFontFamily={docFontFamily}
                        docFontSize={docFontSize}
                        docSpacing={docSpacing}
                        docShowIcons={docShowIcons}
                        docNameSize={docNameSize}
                        docHeaderSize={docHeaderSize}
                        docBodySize={docBodySize}
                        docSectionSpacing={docSectionSpacing}
                        docLineHeight={docLineHeight}
                        docLetterSpacing={docLetterSpacing}
                        docLinkStyle={docLinkStyle}
                        docProjectLinkStyle={docProjectLinkStyle}
                        docRefEmailHyperlink={docRefEmailHyperlink}
                        docRefPhoneHyperlink={docRefPhoneHyperlink}
                        docMarginTop={docMarginTop}
                        docMarginBottom={docMarginBottom}
                        docMarginLeft={docMarginLeft}
                        docMarginRight={docMarginRight}
                      />
                    </div>
                  </div>

                  {/* Page Bottom Margin Spacer */}
                  <div style={{ height: `${docMarginBottom ?? 1.27}cm`, width: '100%', flexShrink: 0 }} />
                </div>

                {/* Page Break Separation Indicator Line */}
                {totalPages > 1 && pageNum < totalPages && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400/30 via-orange-500/50 to-orange-400/30 border-t border-orange-300/40 no-print" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const hasAnyValue = (arr?: any[]) => {
  if (!arr || arr.length === 0) return false;
  return arr.some((item) =>
    Object.entries(item).some(([key, val]) => key !== 'id' && typeof val === 'string' && val.trim().length > 0)
  );
};

// CV Template Preview Component with Full Data Support
const CVTemplatePreview: React.FC<{
  templateId: string;
  customData?: Partial<CVData>;
  docFontFamily?: string;
  docFontSize?: string;
  docSpacing?: string;
  docShowIcons?: boolean;
  docPhotoPosition?: 'left' | 'right';
  docNameSize?: number;
  docHeaderSize?: number;
  docBodySize?: number;
  docSectionSpacing?: number;
  docLineHeight?: number;
  docLetterSpacing?: number;
  docLinkStyle?: 'blue' | 'underline' | 'plain';
  docProjectLinkStyle?: 'name' | 'text' | 'none';
  docRefEmailHyperlink?: boolean;
  docRefPhoneHyperlink?: boolean;
  docMarginTop?: number;
  docMarginBottom?: number;
  docMarginLeft?: number;
  docMarginRight?: number;
}> = ({
  templateId,
  customData,
  docFontFamily = 'sans',
  docFontSize = 'base',
  docSpacing = 'normal',
  docShowIcons = true,
  docPhotoPosition = 'right',
  docNameSize,
  docHeaderSize,
  docBodySize,
  docSectionSpacing,
  docLineHeight,
  docLetterSpacing,
  docLinkStyle = 'blue',
  docProjectLinkStyle = 'text',
  docRefEmailHyperlink = true,
  docRefPhoneHyperlink = true,
  docMarginTop = 1.27,
  docMarginBottom = 1.27,
  docMarginLeft = 1.27,
  docMarginRight = 1.27,
}) => {

  // Data (merges customData with fallback dummy data)
  const dummyData = {
    showIcons: (customData as any)?.showIcons !== undefined ? (customData as any).showIcons : docShowIcons,
    fullName: customData?.fullName?.trim() || 'John Doe',
    jobTitle: customData?.headline?.trim() || 'Senior Software Engineer / Project Manager',
    email: customData?.email?.trim() || 'john.doe@example.com',
    phone: customData?.phone?.trim() || '+62 812-3456-7890',
    location: customData?.location?.trim() || 'Jakarta, Indonesia',
    website: customData?.website?.trim() || 'johndoe.dev',
    linkedin: customData?.linkedin?.trim() || 'linkedin.com/in/johndoe',
    github: customData?.github?.trim() || customData?.socialHandle?.trim() || 'github.com/johndoe',
    socialPlatform: customData?.socialPlatform || 'github',
    photoUrl: customData?.photoUrl !== undefined ? customData.photoUrl : '',
    summary:
      customData?.summary?.trim() ||
      'Senior Software Engineer berpengalaman dalam membangun aplikasi web berkinerja tinggi, scalable, dan ATS friendly.',
    skills:
      customData?.skills && customData.skills.length > 0 && customData.skills[0] !== ''
        ? customData.skills
        : [
            'TypeScript',
            'React',
            'Next.js',
            'Node.js',
            'Tailwind CSS',
            'PostgreSQL',
            'Git',
            'REST API',
          ],
    experience: hasAnyValue(customData?.experience)
      ? customData!.experience!.map((exp) => ({
          company: exp.company || '',
          role: exp.role || '',
          location: exp.location || '',
          period: (exp.startDate || exp.endDate)
            ? `${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : ''}`.trim()
            : (exp.period || ''),
          description: exp.description || '',
        }))
      : [
          {
            company: 'PT Inovasi Teknologi',
            role: 'Senior Software Engineer',
            location: 'Jakarta, Indonesia',
            period: '2023 - Sekarang',
            description:
              'Memimpin pengembangan fitur frontend & backend, mengoptimalkan kecepatan load hingga 45%, dan mengimplementasikan CI/CD.',
          },
          {
            company: 'Solusi Digital Indonesia',
            role: 'Software Engineer',
            location: 'Bandung, Indonesia',
            period: '2021 - 2023',
            description:
              'Mengembangkan API mikroservis dan sistem otentikasi aman untuk 100.000+ pengguna aktif bulanan.',
          },
        ],
    internships: hasAnyValue(customData?.internships)
      ? customData!.internships!.map((item) => ({
          company: item.company || '',
          role: item.role || '',
          location: item.location || '',
          period: (item.startDate || item.endDate)
            ? `${item.startDate || ''}${item.endDate ? ` - ${item.endDate}` : ''}`.trim()
            : (item.period || ''),
          description: item.description || '',
        }))
      : [
          {
            company: 'Tech Startup Indonesia',
            role: 'UI/UX & Frontend Intern',
            period: 'Jan 2023 - Jun 2023',
            description:
              'Membantu tim merancang wireframe dan mendesain 10+ komponen UI serta mengimplementasikannya dengan TailwindCSS.',
          },
        ],
    projects: hasAnyValue(customData?.projects)
      ? customData!.projects!.map((proj) => ({
          name: proj.name || '',
          role: proj.role || '',
          tech: proj.tech || '',
          url: proj.url || proj.link || '',
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          description: proj.description || '',
        }))
      : [
          {
            name: 'E-Commerce Platform',
            role: 'Lead Developer',
            tech: 'React, Node.js, TailwindCSS',
            url: 'https://github.com/johndoe/ecommerce',
            startDate: 'Jan 2023',
            endDate: 'Mar 2024',
            description:
              'Membangun aplikasi toko online dengan fitur payment gateway dan real-time analytics.',
          },
        ],
    organizations: hasAnyValue(customData?.organizations)
      ? customData!.organizations!.map((org) => ({
          name: org.name || '',
          role: org.role || '',
          period: (org.startDate || org.endDate)
            ? `${org.startDate || ''}${org.endDate ? ` - ${org.endDate}` : ''}`.trim()
            : (org.period || ''),
          description: org.description || '',
        }))
      : [
          {
            name: 'Himpunan Mahasiswa Informatika',
            role: 'Ketua Divisi Acara',
            period: '2022 - 2023',
            description:
              'Mengkoordinasikan seminar teknologi nasional dengan 500+ peserta dan mengelola pendaftaran peserta.',
          },
        ],
    education: hasAnyValue(customData?.education)
      ? customData!.education!.map((edu) => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          year: (edu.startDate || edu.endDate)
            ? `${edu.startDate || ''}${edu.endDate ? ` - ${edu.endDate}` : ''}`.trim()
            : (edu.year || ''),
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          description: edu.description || '',
        }))
      : [
          {
            institution: 'Universitas Indonesia',
            degree: 'S1 Teknik Informatika / Ilmu Komputer (IPK 3.75)',
            year: '2017 - 2021',
            gpa: '3.75 / 4.00',
          },
        ],
    photoShape: customData?.photoShape || 'circle',
    photoPosition: customData?.photoPosition || docPhotoPosition || 'right',
    linkStyle: (customData as any)?.linkStyle || docLinkStyle || 'blue',
    certifications: hasAnyValue(customData?.certifications)
      ? customData!.certifications!.map((cert) => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || '',
          credentialId: cert.credentialId || '',
          link: cert.link || '',
        }))
      : [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: 'Nov 2023',
            link: '',
          },
        ],
    languages: hasAnyValue(customData?.languages)
      ? customData!.languages!
      : [
          { id: 'lang-1', language: 'Bahasa Indonesia', level: 'Professional' },
          { id: 'lang-2', language: 'Bahasa Inggris', level: 'Professional' },
        ],
    courses: hasAnyValue(customData?.courses)
      ? customData!.courses!.map((crs) => ({
          courseName: crs.courseName || '',
          institution: crs.institution || '',
          year: crs.startDate ? `${crs.startDate}${crs.endDate ? ` - ${crs.endDate}` : ''}` : (crs.year || ''),
          description: crs.description || '',
        }))
      : [
          {
            id: 'crs-1',
            courseName: 'Digital Marketing Mastery',
            institution: 'RevoU / Google Academy',
            year: '2023',
            description: 'Strategi pemasaran digital dan analisis data.',
          },
        ],
    scholarships: hasAnyValue(customData?.scholarships)
      ? customData!.scholarships!.map((sch) => ({
          name: sch.name || '',
          provider: sch.provider || '',
          year: sch.startDate ? `${sch.startDate}${sch.endDate ? ` - ${sch.endDate}` : ''}` : (sch.year || ''),
          description: sch.description || '',
        }))
      : [
          {
            id: 'sch-1',
            name: 'Beasiswa Djarum Beasiswa Plus',
            provider: 'Djarum Foundation',
            year: '2020',
            description: 'Program pelatihan kepemimpinan dan beasiswa prestasi.',
          },
        ],
    volunteers: hasAnyValue(customData?.volunteers)
      ? customData!.volunteers!.map((vol) => ({
          organization: vol.organization || '',
          role: vol.role || '',
          startYear: vol.startDate ? `${vol.startDate}${vol.endDate ? ` - ${vol.endDate}` : ''}` : (vol.startYear || ''),
          description: vol.description || '',
        }))
      : [
          {
            id: 'vol-1',
            organization: 'Palang Merah Indonesia',
            role: 'Tim Tanggap Bencana',
            startYear: '2022',
            description: 'Mengkoordinasikan logistik darurat dan posko bantuan bencana.',
          },
        ],
    references: hasAnyValue(customData?.references)
      ? customData!.references!.map((ref) => ({
          fullName: ref.fullName || '',
          title: ref.title || '',
          company: ref.company || '',
          email: ref.email || '',
          phone: ref.phone || '',
          note: ref.note || '',
        }))
      : [
          {
            id: 'ref-1',
            fullName: 'John Smith',
            title: 'Engineering Director',
            company: 'PT Inovasi Teknologi',
            email: 'john.smith@inovasi.co.id',
            phone: '+62 812-3456-7890',
            note: '',
          },
        ],
  };

  // Template Renderers
  const renderATSModern = () => {
    const activeOrderKeys = DEFAULT_SECTION_ORDER;

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
                <p className="text-xs italic text-slate-700 mb-0.5">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </p>
                <RenderBulletDescription text={exp.description} />
              </div>
            ))}
          </div>
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN MAGANG
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-600">{item.period}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-0.5">
                  {item.company}{(item as any).location ? ` · ${(item as any).location}` : ''}
                </p>
                <RenderBulletDescription text={item.description} />
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
              {edu.gpa && <p className="text-xs text-slate-600">{edu.gpa}</p>}
              {(edu as any).description && <RenderBulletDescription text={(edu as any).description} />}
            </div>
          ))}
        </div>
      ),
      projects: (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PROYEK UNGGULAN
          </h2>
          {dummyData.projects.map((proj, idx) => {
            const projUrl = (proj as any).url || '';
            const projTech = (proj as any).tech || '';
            const projPeriod = ((proj as any).startDate || (proj as any).endDate)
              ? `${(proj as any).startDate || ''}${(proj as any).endDate ? ` - ${(proj as any).endDate}` : ''}`.trim()
              : '';
            return (
              <div key={idx} className="mb-3">
                <div className="flex items-baseline justify-between mb-0.5">
                  {docProjectLinkStyle === 'name' && projUrl ? (
                    <a href={projUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700 hover:underline">{proj.name}</a>
                  ) : (
                    <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                  )}
                  {projPeriod && <p className="text-xs text-slate-600">{projPeriod}</p>}
                </div>
                {proj.role && <p className="text-xs italic text-slate-700 mb-0.5">{proj.role}</p>}
                {projTech && <p className="text-xs text-slate-600 mb-0.5">{projTech}</p>}
                {docProjectLinkStyle === 'text' && projUrl && (
                  <a href={projUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mb-0.5 inline-block">🔗 Dokumentasi Proyek</a>
                )}
                <RenderBulletDescription text={proj.description} />
              </div>
            );
          })}
        </div>
      ),
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            PENGALAMAN ORGANISASI
          </h2>
          <div className="space-y-3">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.role}</p>
                  <p className="text-xs text-slate-600">{org.period}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{org.name}</p>
                <RenderBulletDescription text={org.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            SERTIFIKAT
          </h2>
          <div className="space-y-3">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{cert.name}</p>
                  <p className="text-xs text-slate-600">{cert.issueDate}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-0.5">{cert.issuer}</p>
                {(cert as any).credentialId && (
                  <p className="text-xs text-slate-500">Credential ID: {(cert as any).credentialId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
            BAHASA
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">
            {dummyData.languages.map(l => `${l.language} (${l.level})`).join('  •  ')}
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
                  <p className="text-xs text-slate-600">{crs.year}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{crs.institution}</p>
                <RenderBulletDescription text={crs.description} />
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
                  <p className="text-xs text-slate-600">{sch.year}</p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{sch.provider}</p>
                <RenderBulletDescription text={sch.description} />
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
                    {vol.startYear ? `${vol.startYear} - Sekarang` : '2022 - Sekarang'}
                  </p>
                </div>
                <p className="text-xs italic text-slate-700 mb-1">{vol.organization}</p>
                <RenderBulletDescription text={vol.description} />
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
                {ref.company && <p className="italic text-slate-600 mb-1">{ref.company}</p>}
                {ref.email && (
                  <p className="text-slate-600">
                    Email:{' '}
                    {docRefEmailHyperlink ? (
                      <a href={getEmailMailto(ref.email)} className="text-blue-600 hover:underline">
                        {ref.email}
                      </a>
                    ) : (
                      ref.email
                    )}
                  </p>
                )}
                {ref.phone && (
                  <p className="text-slate-600">
                    HP:{' '}
                    {docRefPhoneHyperlink ? (
                      <a href={getWaMeUrl(ref.phone)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {ref.phone}
                      </a>
                    ) : (
                      ref.phone
                    )}
                  </p>
                )}
                {ref.note && <p className="text-slate-500 italic mt-0.5">{ref.note}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header */}
        <div className={`border-b-4 border-slate-900 pb-4 mb-6 flex items-start justify-between gap-4 ${dummyData.photoPosition === 'left' ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
              {dummyData.fullName}
            </h1>
            <p className="text-base font-semibold text-slate-700 mb-3">{dummyData.jobTitle}</p>
            <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
          </div>
          {dummyData.photoUrl ? (
            <img
              src={dummyData.photoUrl}
              alt={dummyData.fullName}
              className={`w-20 h-20 ${dummyData.photoShape === 'square' ? 'rounded-lg' : 'rounded-full'} object-cover border border-slate-300 shrink-0 shadow-2xs`}
            />
          ) : null}
        </div>

        {/* Dynamic Reordered Sections */}
        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderMinimalistExecutive = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Ringkasan Eksekutif</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-center px-8">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Keahlian</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 text-center px-8">{dummyData.skills.join(' • ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
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
                <RenderBulletDescription text={exp.description} />
              </div>
            ))}
          </div>
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Pengalaman Magang</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-3 px-4">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-500">{item.period}</p>
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-1">{item.company}</p>
                <RenderBulletDescription text={item.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Proyek Unggulan</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-3 px-4">
            {dummyData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
                <p className="text-xs italic text-slate-600 mb-1">{proj.tech}</p>
                <RenderBulletDescription text={proj.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Pengalaman Organisasi</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-3 px-4">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.name}</p>
                  <p className="text-xs text-slate-500">{org.period}</p>
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-1">{org.role}</p>
                <RenderBulletDescription text={org.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Pendidikan</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center">
            {dummyData.education.map((edu, idx) => (
              <div key={idx}>
                <p className="text-xs font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-700">{edu.degree}</p>
                <p className="text-xs text-slate-600">{edu.year} • {edu.gpa}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Sertifikasi</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center text-xs">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx}>
                <p className="font-bold text-slate-900">{cert.name} — <span className="font-normal italic">{cert.issuer}</span> ({cert.issueDate})</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Bahasa</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <p className="text-xs text-center text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Pelatihan &amp; Kursus</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center text-xs">
            {dummyData.courses.map((crs, idx) => (
              <div key={idx}>
                <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Beasiswa</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center text-xs">
            {dummyData.scholarships.map((sch, idx) => (
              <div key={idx}>
                <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Relawan</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center text-xs">
            {dummyData.volunteers.map((vol, idx) => (
              <div key={idx}>
                <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-800">Referensi</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          <div className="space-y-2 px-4 text-center text-xs">
            {dummyData.references.map((ref, idx) => (
              <div key={idx}>
                <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header - Centered */}
        <div className={`flex flex-col items-center text-center border-b-2 border-slate-300 pb-4 mb-6 ${dummyData.photoPosition === 'left' ? 'sm:flex-row-reverse sm:justify-between sm:text-left' : ''}`}>
          {dummyData.photoUrl ? (
            <img
              src={dummyData.photoUrl}
              alt={dummyData.fullName}
              className={`w-20 h-20 ${dummyData.photoShape === 'square' ? 'rounded-lg' : 'rounded-full'} object-cover border-2 border-slate-300 mb-3 shadow-2xs`}
            />
          ) : null}
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-base font-semibold text-slate-600 mb-3">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderCreativeTech = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            ABOUT ME
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            TECH STACK &amp; SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {dummyData.skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            WORK EXPERIENCE
          </h2>
          <div className="space-y-4">
            {dummyData.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                  <p className="text-xs text-slate-600">{exp.period}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">{exp.company}</p>
                <RenderBulletDescription text={exp.description} />
              </div>
            ))}
          </div>
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            INTERNSHIPS
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-600">{item.period}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">{item.company}</p>
                <RenderBulletDescription text={item.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            FEATURED PROJECTS
          </h2>
          <div className="space-y-3">
            {dummyData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
                <p className="text-xs text-emerald-600 mb-1">{proj.tech}</p>
                <RenderBulletDescription text={proj.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            ORGANIZATIONS
          </h2>
          <div className="space-y-3">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.name}</p>
                  <p className="text-xs text-slate-600">{org.period}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">{org.role}</p>
                <RenderBulletDescription text={org.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            CERTIFICATIONS
          </h2>
          <div className="space-y-2">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">{cert.name} — <em className="text-emerald-600 font-normal">{cert.issuer}</em></span>
                <span className="text-slate-600">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            COURSES &amp; TRAINING
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — <span className="text-emerald-600">{crs.institution}</span> ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            VOLUNTEER EXPERIENCE
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500"></span>
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header with accent */}
        <div className="border-l-8 border-emerald-500 pl-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
            {dummyData.fullName}
          </h1>
          <p className="text-base font-bold text-emerald-600 mb-2">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderFreshGraduate = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-amber-800 mb-2">
            OBJECTIVE
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">{dummyData.summary}</p>
        </div>
      ),
      education: (
        <div key="education" className="mb-6">
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
      ),
      skills: (
        <div key="skills" className="mb-6">
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
      ),
      projects: (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            PROYEK &amp; PORTOFOLIO
          </h2>
          <div className="space-y-3">
            {dummyData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
                <p className="text-xs text-amber-600 mb-2">{proj.tech}</p>
                <RenderBulletDescription text={proj.description} />
              </div>
            ))}
          </div>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
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
                <RenderBulletDescription text={exp.description} />
              </div>
            ))}
          </div>
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            PENGALAMAN MAGANG
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-600">{item.period}</p>
                </div>
                <p className="text-xs italic text-amber-700 mb-1">{item.company}</p>
                <RenderBulletDescription text={item.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            PENGALAMAN ORGANISASI
          </h2>
          <div className="space-y-3">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.name}</p>
                  <p className="text-xs text-slate-600">{org.period}</p>
                </div>
                <p className="text-xs font-semibold text-amber-700 mb-1">{org.role}</p>
                <RenderBulletDescription text={org.description} />
              </div>
            ))}
          </div>
        </div>
      ) : null,
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            SERTIFIKAT
          </h2>
          <div className="space-y-2 text-xs">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-bold text-slate-900">{cert.name} — <em className="text-amber-700 font-normal">{cert.issuer}</em></span>
                <span className="text-slate-600">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            BAHASA
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            KURSUS &amp; PELATIHAN
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            BEASISWA
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            RELAWAN
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 border-b-2 border-amber-500 pb-1 mb-3">
            REFERENSI
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-base font-semibold text-amber-600 mb-3">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderHarvardModern = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">SUMMARY</h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">EXPERIENCE</h2>
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-3">
              <div className="text-xs font-bold text-slate-600 uppercase">{exp.period}</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs font-semibold text-slate-700">{exp.company}</p>
                <RenderBulletDescription text={exp.description} />
              </div>
            </div>
          ))}
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">INTERNSHIPS</h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-3">
              <div className="text-xs font-bold text-slate-600 uppercase">{item.period}</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs font-semibold text-slate-700">{item.company}</p>
                <RenderBulletDescription text={item.description} />
              </div>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">PROJECTS</h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-3">
              <div className="text-xs font-bold text-slate-600 uppercase">{proj.name}</div>
              <div>
                <p className="text-xs italic text-slate-700">{proj.tech}</p>
                <RenderBulletDescription text={proj.description} />
              </div>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">ORGANIZATIONS</h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-3">
              <div className="text-xs font-bold text-slate-600 uppercase">{org.period}</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs font-semibold text-slate-700">{org.role}</p>
                <RenderBulletDescription text={org.description} />
              </div>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">EDUCATION</h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2">
              <div className="text-xs font-bold text-slate-600 uppercase">{edu.year}</div>
              <div>
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
              </div>
            </div>
          ))}
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">SKILLS</h2>
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <div className="text-xs font-bold text-slate-600 uppercase">Core Skills</div>
            <p className="text-xs text-slate-700">{dummyData.skills.join(' • ')}</p>
          </div>
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">CERTIFICATIONS</h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2 text-xs">
              <div className="font-bold text-slate-600 uppercase">{cert.issueDate}</div>
              <div>
                <p className="font-bold text-slate-900">{cert.name} — <em>{cert.issuer}</em></p>
              </div>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">LANGUAGES</h2>
          <div className="grid grid-cols-[140px_1fr] gap-4 text-xs">
            <div className="font-bold text-slate-600 uppercase">Languages</div>
            <p className="text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
          </div>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">COURSES</h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2 text-xs">
              <div className="font-bold text-slate-600 uppercase">{crs.year}</div>
              <div>
                <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">SCHOLARSHIPS</h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2 text-xs">
              <div className="font-bold text-slate-600 uppercase">{sch.year}</div>
              <div>
                <p className="font-bold text-slate-900">{sch.name} — {sch.provider}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">VOLUNTEER</h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2 text-xs">
              <div className="font-bold text-slate-600 uppercase">{vol.organization}</div>
              <div>
                <p className="font-bold text-slate-900">{vol.role}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">REFERENCES</h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="grid grid-cols-[140px_1fr] gap-4 mb-2 text-xs">
              <div className="font-bold text-slate-600 uppercase">{ref.company}</div>
              <div>
                <p className="font-bold text-slate-900">{ref.fullName} ({ref.title})</p>
              </div>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-3 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            {dummyData.fullName}
          </h1>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} separator="|" className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center mt-2" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderBlueAccent = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">PROFESSIONAL SUMMARY</h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">SKILLS</h2>
          <p className="text-xs text-slate-700">{dummyData.skills.join(' • ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">WORK EXPERIENCE</h2>
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs italic text-blue-700 mb-2">{exp.company}</p>
              <RenderBulletDescription text={exp.description} />
            </div>
          ))}
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">INTERNSHIPS</h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-slate-600">{item.period}</p>
              </div>
              <p className="text-xs italic text-blue-700 mb-1">{item.company}</p>
              <RenderBulletDescription text={item.description} />
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">PROJECTS</h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs italic text-blue-700 mb-1">{proj.tech}</p>
              <RenderBulletDescription text={proj.description} />
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">ORGANIZATIONS</h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-600">{org.period}</p>
              </div>
              <p className="text-xs italic text-blue-700 mb-1">{org.role}</p>
              <RenderBulletDescription text={org.description} />
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">EDUCATION</h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">CERTIFICATIONS</h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">{cert.name} — <em className="text-blue-700">{cert.issuer}</em></span>
              <span className="text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">LANGUAGES</h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">COURSES</h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">SCHOLARSHIPS</h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">VOLUNTEER</h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-800 border-b-2 border-blue-600 pb-1 mb-3">REFERENCES</h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        <div className="border-b-3 border-blue-600 pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase text-blue-900">{dummyData.fullName}</h1>
          <p className="text-base font-semibold text-blue-600 mt-1">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-wrap gap-x-3 gap-y-1 items-center mt-2" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderElegantPhoto = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">SUMMARY</h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">SKILLS</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{dummyData.skills.join(' • ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">EXPERIENCE</h2>
          {dummyData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{exp.role}</p>
                <p className="text-xs text-slate-600">{exp.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-2">{exp.company}</p>
              <RenderBulletDescription text={exp.description} />
            </div>
          ))}
        </div>
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">INTERNSHIPS</h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-slate-600">{item.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-1">{item.company}</p>
              <RenderBulletDescription text={item.description} />
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">PROJECTS</h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs italic text-purple-600 mb-1">{proj.tech}</p>
              <RenderBulletDescription text={proj.description} />
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">ORGANIZATIONS</h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-600">{org.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-1">{org.role}</p>
              <RenderBulletDescription text={org.description} />
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">EDUCATION</h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">CERTIFICATIONS</h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">{cert.name} — <em className="text-purple-600">{cert.issuer}</em></span>
              <span className="text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">LANGUAGES</h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">COURSES</h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">SCHOLARSHIPS</h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">VOLUNTEER</h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-purple-400 pb-1 mb-3">REFERENCES</h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        <div className={`flex items-start gap-6 border-b-2 border-purple-600 pb-4 mb-6 ${dummyData.photoPosition === 'left' ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase text-slate-900">{dummyData.fullName}</h1>
            <p className="text-base font-semibold text-purple-600 mt-1">{dummyData.jobTitle}</p>
            <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-wrap gap-x-3 gap-y-1 items-center mt-2" />
          </div>
          {dummyData.photoUrl ? (
            <img
              src={dummyData.photoUrl}
              alt={dummyData.fullName}
              className={`w-24 h-24 ${dummyData.photoShape === 'square' ? 'rounded-lg' : 'rounded-full'} object-cover border-2 border-purple-600 shrink-0`}
            />
          ) : (
            <div className={`w-24 h-24 border-2 border-purple-600 ${dummyData.photoShape === 'square' ? 'rounded-lg' : 'rounded-full'} bg-slate-100 flex items-center justify-center text-xs text-slate-400 shrink-0`}>
              Photo
            </div>
          )}
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderReziClassic = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Professional Summary</h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Skills</h2>
          <p className="text-xs text-slate-700">{dummyData.skills.join(', ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Internships</h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-slate-600 italic">{item.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-1">{item.company}</p>
              <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Projects</h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs italic text-slate-700 mb-1">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Organizations</h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-600 italic">{org.period}</p>
              </div>
              <p className="text-xs italic text-slate-700 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Education</h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600 italic">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Certifications</h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">{cert.name} — <em>{cert.issuer}</em></span>
              <span className="text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Languages</h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Courses</h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Scholarships</h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">Volunteer</h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-900 pb-1 mb-3">References</h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white font-serif" style={{ fontFamily: selectedFontFamily }}>
        <div className="text-center border-b border-slate-400 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{dummyData.fullName}</h1>
          <p className="text-base text-slate-700 mt-2">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} separator="|" className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center mt-2" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderModernOrange = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <h2 className="text-sm font-black uppercase text-orange-800 mb-2">ABOUT ME</h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
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
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            INTERNSHIPS
          </h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3 pl-4 border-l-2 border-orange-300">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-orange-600 font-semibold">{item.period}</p>
              </div>
              <p className="text-xs font-bold text-orange-600 mb-1">{item.company}</p>
              <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3 pl-4 border-l-2 border-orange-300">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs text-orange-600 mb-1">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3 pl-4 border-l-2 border-orange-300">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-orange-600 font-semibold">{org.period}</p>
              </div>
              <p className="text-xs font-bold text-orange-600 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2">
              <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
              <p className="text-xs text-slate-700">{edu.degree}</p>
              <p className="text-xs text-orange-600 font-semibold">{edu.year} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2 text-xs">
              <p className="font-bold text-slate-900">{cert.name} — <span className="text-orange-600">{cert.issuer}</span> ({cert.issueDate})</p>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-700 pl-4">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="pl-4 border-l-2 border-orange-300 mb-2 text-xs">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header with Orange Accent */}
        <div className="border-l-8 border-orange-500 pl-6 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
            {dummyData.fullName}
          </h1>
          <p className="text-lg font-bold text-orange-600 mb-2">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderExecutiveNavy = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6 mt-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            EXECUTIVE PROFILE
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 font-medium">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            CORE COMPETENCIES
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {dummyData.skills.map((skill, idx) => (
              <div key={idx} className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                {skill}
              </div>
            ))}
          </div>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            INTERNSHIPS
          </h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-blue-900">{item.role}</p>
                <p className="text-xs text-slate-600 font-semibold">{item.period}</p>
              </div>
              <p className="text-xs font-bold text-slate-800 mb-1">{item.company}</p>
              <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-blue-900">{proj.name}</p>
              <p className="text-xs font-semibold text-slate-600 mb-1">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-blue-900">{org.name}</p>
                <p className="text-xs text-slate-600 font-semibold">{org.period}</p>
              </div>
              <p className="text-xs font-semibold text-slate-700 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-700">{edu.degree}</p>
              </div>
              <p className="text-xs text-slate-600">{edu.year} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">{cert.name} — <em className="text-blue-900">{cert.issuer}</em></span>
              <span className="text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-blue-900 border-b-3 border-blue-900 pb-1 mb-3">
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Navy Header Block */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 mb-6 -mx-12 -mt-12 shadow-lg">
          <h1 className="text-3xl font-black uppercase tracking-wide mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-lg font-semibold text-blue-200 mb-3">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} separator="|" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderTechSidebar = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            ABOUT
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            SKILLS OVERVIEW
          </h2>
          <p className="text-xs text-slate-700">{dummyData.skills.join(' • ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            INTERNSHIPS
          </h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-slate-600">{item.period}</p>
              </div>
              <p className="text-xs font-semibold text-cyan-700 mb-1">{item.company}</p>
              <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs text-cyan-700 mb-1">{proj.tech}</p>
              <p className="text-xs text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-600">{org.period}</p>
              </div>
              <p className="text-xs font-semibold text-cyan-700 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa} ({edu.year})</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">{cert.name} — <em className="text-cyan-700">{cert.issuer}</em></span>
              <span className="text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-slate-900 border-b-2 border-cyan-600 pb-1 mb-3">
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="flex min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Left Sidebar - Tech Stack */}
        <div className="w-64 bg-cyan-900 text-white p-6 shrink-0">
          <div className="mb-6">
            <h1 className="text-xl font-black uppercase tracking-tight mb-1">
              {dummyData.fullName.split(' ')[0]}
            </h1>
            <h1 className="text-xl font-black uppercase tracking-tight mb-3">
              {dummyData.fullName.split(' ').slice(1).join(' ')}
            </h1>
            <p className="text-sm font-semibold text-cyan-300">{dummyData.jobTitle}</p>
          </div>

          <div className="mb-6">
            <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-col gap-1" />
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
              <p className="break-all">{dummyData.github}</p>
              <p className="break-all">{dummyData.linkedin}</p>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-10">
          {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
        </div>
      </div>
    );
  };

  const renderCharcoalWhite = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-8">
          <p className="text-xs leading-relaxed text-slate-700 text-center max-w-3xl mx-auto">
            {dummyData.summary}
          </p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-8">
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
      ),
      experience: (
        <div key="experience" className="mb-8">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
            Internships
          </h2>
          <div className="space-y-4 text-center">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{item.role}</p>
                <p className="text-xs font-semibold text-slate-600 mb-1">{item.company} ({item.period})</p>
                <p className="text-xs leading-relaxed text-slate-700 max-w-2xl mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
            Projects
          </h2>
          <div className="space-y-4 text-center">
            {dummyData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{proj.name}</p>
                <p className="text-xs italic text-slate-600 mb-1">{proj.tech}</p>
                <p className="text-xs leading-relaxed text-slate-700 max-w-2xl mx-auto">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
            Organizations
          </h2>
          <div className="space-y-4 text-center">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900 mb-1">{org.name}</p>
                <p className="text-xs font-semibold text-slate-600 mb-1">{org.role} ({org.period})</p>
                <p className="text-xs leading-relaxed text-slate-700 max-w-2xl mx-auto">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-8 text-center">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Education
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
              <p className="text-xs text-slate-700">{edu.degree} • {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Certifications
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">{cert.name} — {cert.issuer} ({cert.issueDate})</p>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Languages
          </h2>
          <p className="text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Courses
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">{crs.courseName} — {crs.institution}</p>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Scholarships
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">{sch.name} — {sch.provider}</p>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Volunteer
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">{vol.role} — {vol.organization}</p>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-8 text-center text-xs">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            References
          </h2>
          {dummyData.references.map((ref, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">{ref.fullName} ({ref.title} — {ref.company})</p>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Minimal Header */}
        <div className="text-center border-b border-slate-300 pb-6 mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-3">
            {dummyData.fullName}
          </h1>
          <p className="text-sm font-medium text-slate-600 mb-3">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderGreenEco = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">PROFESSIONAL SUMMARY</h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 pl-10">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
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
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">INTERNSHIPS</h2>
          </div>
          <div className="space-y-3 pl-10">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-sm font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-green-600 font-semibold">{item.period}</p>
                </div>
                <p className="text-xs font-semibold text-green-700 mb-1">{item.company}</p>
                <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">PROJECTS</h2>
          </div>
          <div className="space-y-3 pl-10">
            {dummyData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                <p className="text-xs text-green-700 mb-1">{proj.tech}</p>
                <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">ORGANIZATIONS</h2>
          </div>
          <div className="space-y-3 pl-10">
            {dummyData.organizations.map((org, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-sm font-bold text-slate-900">{org.name}</p>
                  <p className="text-xs text-green-600 font-semibold">{org.period}</p>
                </div>
                <p className="text-xs font-semibold text-green-700 mb-1">{org.role}</p>
                <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">EDUCATION</h2>
          </div>
          <div className="pl-10">
            {dummyData.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-sm font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-700">{edu.degree}</p>
                <p className="text-xs text-green-600 font-semibold">{edu.gpa} ({edu.year})</p>
              </div>
            ))}
          </div>
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">CERTIFICATIONS</h2>
          </div>
          <div className="pl-10 space-y-1 text-xs">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-bold text-slate-900">{cert.name} — <em className="text-green-700">{cert.issuer}</em></span>
                <span className="text-slate-600">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">LANGUAGES</h2>
          </div>
          <p className="text-xs text-slate-700 pl-10">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">COURSES</h2>
          </div>
          <div className="pl-10 space-y-1 text-xs">
            {dummyData.courses.map((crs, idx) => (
              <p key={idx} className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            ))}
          </div>
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">SCHOLARSHIPS</h2>
          </div>
          <div className="pl-10 space-y-1 text-xs">
            {dummyData.scholarships.map((sch, idx) => (
              <p key={idx} className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            ))}
          </div>
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">VOLUNTEER</h2>
          </div>
          <div className="pl-10 space-y-1 text-xs">
            {dummyData.volunteers.map((vol, idx) => (
              <p key={idx} className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            ))}
          </div>
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-0.5 bg-green-600"></div>
            <h2 className="text-sm font-black uppercase text-green-800">REFERENCES</h2>
          </div>
          <div className="pl-10 space-y-1 text-xs">
            {dummyData.references.map((ref, idx) => (
              <p key={idx} className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            ))}
          </div>
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Header with Green Accent */}
        <div className="mb-6 pb-4 border-b-4 border-green-600">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-base font-bold text-green-600 mb-2">{dummyData.jobTitle}</p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderResearchAcademic = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 mb-2 text-center">
            Research Interests &amp; Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 text-center">{dummyData.summary}</p>
        </div>
      ),
      education: (
        <div key="education" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-base font-bold text-slate-900">{edu.institution}</p>
                <p className="text-xs text-slate-600">{edu.year}</p>
              </div>
              <p className="text-sm font-semibold text-indigo-700 mb-1">{edu.degree}</p>
              <p className="text-xs text-slate-700">{edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      experience: (
        <div key="experience" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            RESEARCH &amp; PROFESSIONAL EXPERIENCE
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            INTERNSHIP EXPERIENCE
          </h2>
          {dummyData.internships.map((item, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{item.role}</p>
                <p className="text-xs text-slate-600">{item.period}</p>
              </div>
              <p className="text-xs font-semibold text-indigo-700 mb-1">{item.company}</p>
              <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            PUBLICATIONS &amp; PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-sm font-bold text-slate-900">{proj.name}</p>
              <p className="text-xs text-indigo-700 mb-1">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            ACADEMIC ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-sm font-bold text-slate-900">{org.name}</p>
                <p className="text-xs text-slate-600">{org.period}</p>
              </div>
              <p className="text-xs font-semibold text-indigo-700 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      skills: (
        <div key="skills" className="mb-6">
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
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            HONORS &amp; CERTIFICATIONS
          </h2>
          <div className="space-y-1 text-xs">
            {dummyData.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-bold text-slate-900">{cert.name} — <em className="text-indigo-700">{cert.issuer}</em></span>
                <span className="text-slate-600">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            COURSES &amp; SYMPOSIUMS
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            FELLOWSHIPS &amp; SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            COMMUNITY SERVICE
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="text-sm font-black uppercase text-indigo-900 border-b border-indigo-700 pb-1 mb-3">
            ACADEMIC REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-700">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] bg-white" style={{ fontFamily: selectedFontFamily }}>
        {/* Academic Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-indigo-700">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
            {dummyData.jobTitle}
          </p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} separator="|" className="text-xs flex flex-wrap justify-center gap-x-3 gap-y-1 items-center" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderKetikMonospace = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // SUMMARY
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // TECH STACK &amp; SKILLS
          </h2>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {dummyData.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px]">
                [{skill}]
              </span>
            ))}
          </div>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-5">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-3">
            // INTERNSHIPS
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-xs font-bold text-slate-900">{item.role} @ {item.company}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">{item.period}</p>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 pl-3 border-l-2 border-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-xs font-bold text-slate-900">{proj.name} ({proj.tech})</p>
              <p className="text-xs text-slate-700 pl-3 border-l-2 border-slate-300">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-xs font-bold text-slate-900">{org.name} ({org.role})</p>
              <p className="text-xs text-slate-700 pl-3 border-l-2 border-slate-300">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-slate-900">{edu.institution}</p>
                <p className="text-[11px] text-slate-500">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-700">{edu.degree} — {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <p key={idx} className="text-xs text-slate-700">
              [{cert.issueDate}] {cert.name} ({cert.issuer})
            </p>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // LANGUAGES
          </h2>
          <p className="text-xs text-slate-700">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <p key={idx} className="text-xs text-slate-700">{crs.courseName} — {crs.institution}</p>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <p key={idx} className="text-xs text-slate-700">{sch.name} — {sch.provider}</p>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <p key={idx} className="text-xs text-slate-700">{vol.role} — {vol.organization}</p>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-5">
          <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-dashed border-slate-400 pb-1 mb-2">
            // REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <p key={idx} className="text-xs text-slate-700">{ref.fullName} ({ref.title} — {ref.company})</p>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-10 min-h-[297mm] text-slate-800 bg-white font-mono" style={{ fontFamily: selectedFontFamily }}>
        {/* Typewriter Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            {dummyData.fullName}
          </h1>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {`[role: "${dummyData.jobTitle}"]`}
          </p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} separator="|" className="text-[11px] flex flex-wrap gap-x-2 gap-y-1 items-center" />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderKetatSerif = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            SUMMARY
          </h2>
          <p className="text-xs leading-relaxed text-slate-800">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            SKILLS
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed">{dummyData.skills.join(' • ')}</p>
        </div>
      ),
      experience: (
        <div key="experience" className="mb-5">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-3">
            INTERNSHIP EXPERIENCE
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-xs font-bold text-slate-900">{item.company} — <span className="font-normal italic">{item.role}</span></p>
                  <p className="text-[11px] italic text-slate-600">{item.period}</p>
                </div>
                <p className="text-xs leading-relaxed text-slate-800">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            FEATURED PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-xs font-bold text-slate-900">{proj.name} — <span className="font-normal italic">{proj.tech}</span></p>
              <p className="text-xs leading-relaxed text-slate-800">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-slate-900">{org.name} — <span className="font-normal italic">{org.role}</span></p>
                <p className="text-[11px] italic text-slate-600">{org.period}</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-800">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-slate-900">{edu.institution}</p>
                <p className="text-[11px] italic text-slate-600">{edu.year}</p>
              </div>
              <p className="text-xs text-slate-800">{edu.degree} ({edu.gpa})</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-xs text-slate-800 mb-1">
              <span>{cert.name} — <em>{cert.issuer}</em></span>
              <span className="text-[11px] text-slate-600">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            LANGUAGES
          </h2>
          <p className="text-xs text-slate-800">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution} ({crs.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider} ({sch.year})</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="mb-2 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5 mb-2">
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="text-xs text-slate-800 mb-1">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-10 min-h-[297mm] text-slate-900 bg-white font-serif" style={{ fontFamily: selectedFontFamily }}>
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            {dummyData.fullName}
          </h1>
          <p className="text-xs font-medium text-slate-700 italic mb-2">
            {dummyData.jobTitle}
          </p>
          <div className="border-b-2 border-slate-900 pb-3">
            <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
          </div>
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderLuasaMinimal = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            PROFILE
          </h2>
          <p className="text-xs leading-loose text-slate-600 font-normal">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-8">
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
      ),
      experience: (
        <div key="experience" className="mb-8">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            INTERNSHIPS
          </h2>
          <div className="space-y-4">
            {dummyData.internships.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xs font-semibold text-slate-900">{item.role}</h3>
                  <span className="text-[11px] text-slate-400">{item.period}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-1">{item.company}</p>
                <p className="text-xs leading-loose text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="text-xs font-semibold text-slate-900">{proj.name}</h3>
              <p className="text-xs text-slate-400 mb-1">{proj.tech}</p>
              <p className="text-xs leading-loose text-slate-600">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-xs font-semibold text-slate-900">{org.name}</h3>
                <span className="text-[11px] text-slate-400">{org.period}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1">{org.role}</p>
              <p className="text-xs leading-loose text-slate-600">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-xs font-semibold text-slate-900">{edu.institution}</p>
              <p className="text-xs text-slate-500">{edu.degree} • {edu.gpa}</p>
              <span className="text-[11px] text-slate-400">{edu.year}</span>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between mb-1">
              <span className="font-semibold text-slate-800">{cert.name} — {cert.issuer}</span>
              <span className="text-slate-400">{cert.issueDate}</span>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            LANGUAGES
          </h2>
          <p className="text-slate-600">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <p key={idx} className="text-slate-700 font-medium mb-1">{crs.courseName} — {crs.institution}</p>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <p key={idx} className="text-slate-700 font-medium mb-1">{sch.name} — {sch.provider}</p>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <p key={idx} className="text-slate-700 font-medium mb-1">{vol.role} — {vol.organization}</p>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-8 text-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <p key={idx} className="text-slate-700 font-medium mb-1">{ref.fullName} ({ref.title} — {ref.company})</p>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-12 min-h-[297mm] font-sans bg-white text-slate-800" style={{ fontFamily: selectedFontFamily }}>
        {/* Header with generous spacing */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-light tracking-wide text-slate-900 mb-2">
            {dummyData.fullName}
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">
            {dummyData.jobTitle}
          </p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };

  const renderTebalBold = () => {
    const activeOrderKeys = customData?.sectionOrder && customData.sectionOrder.length > 0 ? customData.sectionOrder : DEFAULT_SECTION_ORDER;
    const sectionBlocks: Record<string, React.ReactNode> = {
      summary: (
        <div key="summary" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            ABOUT ME
          </h2>
          <p className="text-xs font-medium leading-relaxed text-slate-800">{dummyData.summary}</p>
        </div>
      ),
      skills: (
        <div key="skills" className="mb-6">
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
      ),
      experience: (
        <div key="experience" className="mb-6">
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
      ),
      internships: dummyData.internships.length > 0 ? (
        <div key="internships" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-4">
            INTERNSHIPS
          </h2>
          <div className="space-y-3">
            {dummyData.internships.map((item, idx) => (
              <div key={idx} className="border-l-2 border-slate-900 pl-3">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xs font-black uppercase text-slate-900">{item.role}</h3>
                  <span className="text-[11px] font-bold text-slate-600">{item.period}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1">{item.company}</p>
                <p className="text-xs leading-relaxed text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null,
      projects: dummyData.projects.length > 0 ? (
        <div key="projects" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            PROJECTS
          </h2>
          {dummyData.projects.map((proj, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-2">
              <p className="text-xs font-black uppercase text-slate-900">{proj.name}</p>
              <p className="text-xs font-semibold text-slate-600 mb-1">{proj.tech}</p>
              <p className="text-xs leading-relaxed text-slate-700">{proj.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      organizations: dummyData.organizations.length > 0 ? (
        <div key="organizations" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            ORGANIZATIONS
          </h2>
          {dummyData.organizations.map((org, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-xs font-black uppercase text-slate-900">{org.name}</h3>
                <span className="text-[11px] font-bold text-slate-600">{org.period}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 mb-1">{org.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{org.description}</p>
            </div>
          ))}
        </div>
      ) : null,
      education: (
        <div key="education" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            EDUCATION
          </h2>
          {dummyData.education.map((edu, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-2">
              <p className="text-xs font-black text-slate-900">{edu.institution}</p>
              <p className="text-xs font-semibold text-slate-700">{edu.degree}</p>
              <p className="text-[11px] text-slate-600">{edu.year} — {edu.gpa}</p>
            </div>
          ))}
        </div>
      ),
      certifications: dummyData.certifications.length > 0 ? (
        <div key="certifications" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            CERTIFICATIONS
          </h2>
          {dummyData.certifications.map((cert, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-1 text-xs">
              <p className="font-bold text-slate-900">{cert.name} — {cert.issuer} ({cert.issueDate})</p>
            </div>
          ))}
        </div>
      ) : null,
      languages: dummyData.languages.length > 0 ? (
        <div key="languages" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            LANGUAGES
          </h2>
          <p className="text-xs font-bold text-slate-800">{dummyData.languages.map(l => `${l.language} (${l.level})`).join(' • ')}</p>
        </div>
      ) : null,
      courses: dummyData.courses.length > 0 ? (
        <div key="courses" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            COURSES
          </h2>
          {dummyData.courses.map((crs, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-1 text-xs">
              <p className="font-bold text-slate-900">{crs.courseName} — {crs.institution}</p>
            </div>
          ))}
        </div>
      ) : null,
      scholarships: dummyData.scholarships.length > 0 ? (
        <div key="scholarships" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            SCHOLARSHIPS
          </h2>
          {dummyData.scholarships.map((sch, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-1 text-xs">
              <p className="font-bold text-slate-900">{sch.name} — {sch.provider}</p>
            </div>
          ))}
        </div>
      ) : null,
      volunteers: dummyData.volunteers.length > 0 ? (
        <div key="volunteers" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            VOLUNTEER
          </h2>
          {dummyData.volunteers.map((vol, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-1 text-xs">
              <p className="font-bold text-slate-900">{vol.role} — {vol.organization}</p>
            </div>
          ))}
        </div>
      ) : null,
      references: dummyData.references.length > 0 ? (
        <div key="references" className="mb-6">
          <h2 className="bg-slate-900 text-white px-2 py-1 inline-block font-black text-xs uppercase tracking-wider mb-3">
            REFERENCES
          </h2>
          {dummyData.references.map((ref, idx) => (
            <div key={idx} className="border-l-2 border-slate-900 pl-3 mb-1 text-xs">
              <p className="font-bold text-slate-900">{ref.fullName} ({ref.title} — {ref.company})</p>
            </div>
          ))}
        </div>
      ) : null,
    };

    return (
      <div className="p-10 min-h-[297mm] font-sans bg-white text-slate-900" style={{ fontFamily: selectedFontFamily }}>
        {/* Oversized Name Header */}
        <div className="mb-6 pb-4 border-b-4 border-slate-900">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">
            {dummyData.fullName}
          </h1>
          <p className="text-sm font-bold uppercase text-slate-700 mb-3">
            {dummyData.jobTitle}
          </p>
          <RenderContactHeaderLinks dummyData={dummyData} docLinkStyle={docLinkStyle} docShowIcons={docShowIcons} />
        </div>

        {activeOrderKeys.map((key) => sectionBlocks[key] || null)}
      </div>
    );
  };


  // Map Document Settings to Dynamic CSS & Style Properties
  const fontStyleMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    openSans: "'Open Sans', sans-serif",
    googleSans: "'Google Sans', 'Plus Jakarta Sans', -apple-system, sans-serif",
    montserrat: "'Montserrat', sans-serif",
    lato: "'Lato', sans-serif",
    sans: "'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'EB Garamond', 'Lora', 'Georgia', Cambria, 'Times New Roman', serif",
    mono: "'JetBrains Mono', 'Courier Prime', 'Fira Code', 'Consolas', monospace",
    standard: "'Carlito', 'Arimo', 'Calibri', 'Arial', sans-serif",
  };

  const fontSizeMap: Record<string, string> = {
    sm: '0.9em',
    base: '1em',
    md: '1.08em',
    lg: '1.18em',
  };

  const spacingClassMap: Record<string, string> = {
    compact: '[&_.mb-6]:mb-3 [&_.mb-4]:mb-2 [&_.mb-3]:mb-1.5 [&_.space-y-4]:space-y-2 [&_.space-y-3]:space-y-1.5 [&_.py-6]:py-3 [&_.p-6]:p-4 [&_.p-12]:p-6',
    spacious: '[&_.mb-6]:mb-8 [&_.mb-4]:mb-6 [&_.mb-3]:mb-4 [&_.space-y-4]:space-y-6 [&_.space-y-3]:space-y-4 [&_.py-6]:py-8 [&_.p-6]:p-8 [&_.p-12]:p-14',
    normal: '',
  };

  const selectedFontFamily = fontStyleMap[docFontFamily] || fontStyleMap.sans;
  const selectedFontSize = fontSizeMap[docFontSize] || fontSizeMap.base;
  const selectedSpacingClass = spacingClassMap[docSpacing] || '';

  // Template Router
  const getTemplateContent = () => {
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

  return (
    <div
      className={`w-full min-h-[297mm] bg-white text-slate-900 transition-all duration-200 ${selectedSpacingClass}`}
      style={{
        fontFamily: selectedFontFamily,
        fontSize: selectedFontSize,
        lineHeight: docLineHeight !== undefined ? `${docLineHeight}` : undefined,
        letterSpacing: docLetterSpacing !== undefined ? `${docLetterSpacing}px` : undefined,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lato:wght@400;700;900&family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&family=Roboto:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        .cv-template-root {
          --cv-margin-top: ${docMarginTop}cm;
          --cv-margin-bottom: ${docMarginBottom}cm;
          --cv-margin-left: ${docMarginLeft}cm;
          --cv-margin-right: ${docMarginRight}cm;
        }
        .cv-template-root > div {
          padding-left: var(--cv-margin-left) !important;
          padding-right: var(--cv-margin-right) !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        ${docNameSize ? `.cv-template-root h1 { font-size: ${docNameSize}px !important; }` : ''}
        ${docHeaderSize ? `.cv-template-root h2 { font-size: ${docHeaderSize}px !important; }` : ''}
        ${docBodySize ? `.cv-template-root p, .cv-template-root span, .cv-template-root div:not(.cv-no-custom-size) { font-size: ${docBodySize}px !important; }` : ''}
        ${docSectionSpacing ? `.cv-template-root .mb-6, .cv-template-root .mb-8, .cv-template-root .mb-5 { margin-bottom: ${docSectionSpacing}px !important; }` : ''}
      `}</style>
      <div className="cv-template-root w-full h-full">
        {getTemplateContent()}
      </div>
    </div>
  );
};

// Mini Visual Live Scaled A4 Template Preview (Halaman 1 Saja) for Layout Gallery Cards
const TemplateThumbnailVisual: React.FC<{ templateId: string; customData?: Partial<CVData> }> = ({
  templateId,
  customData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.15);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          // Exactly scale Page 1 (210mm x 297mm) to fit thumbnail container width
          const calculatedScale = width / 794;
          setScale(calculatedScale);
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none rounded-md"
    >
      <div
        className="w-[210mm] h-[297mm] bg-white pointer-events-none absolute top-0 left-0 overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: '210mm',
          height: '297mm',
        }}
      >
        <CVTemplatePreview templateId={templateId} customData={customData} />
      </div>
    </div>
  );
};
