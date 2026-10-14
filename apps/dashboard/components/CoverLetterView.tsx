'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/Toast';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { userApi, coverLetterApi, cvApi, trackerApi } from '@/lib/api';
import {
  Mail,
  Sparkles,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  FileText,
  Send,
  Building,
  UserCheck,
  RefreshCw,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Award,
  Zap,
  ArrowRight,
  Bookmark,
  Edit3,
  Check,
  FileCheck2,
  ExternalLink,
  Paperclip,
  Search,
  X,
  ClipboardPaste,
} from 'lucide-react';

export interface CoverLetterPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  generate: (params: {
    userName: string;
    company: string;
    position: string;
    recruiterName?: string;
    highlights?: string;
  }) => string;
}

export const COVER_LETTER_PRESETS: CoverLetterPreset[] = [
  {
    id: 'fresh-grad',
    name: 'Fresh Graduate',
    badge: 'Lulusan Baru / Pemula',
    description: 'Menonjolkan motivasi tinggi, kecepatan belajar, dan latar pendidikan relevan.',
    icon: GraduationCap,
    generate: ({ userName, company, position, recruiterName, highlights }) =>
      `Kepada Yth. ${recruiterName || 'Bapak/Ibu HRD'}\n${company || '[Nama Perusahaan]'}\n\nDengan hormat,\n\nPerkenalkan saya ${userName || '[Nama Anda]'}, lulusan baru yang berdedikasi dan memiliki antusiasme tinggi untuk berkontribusi pada posisi ${position || '[Posisi Pekerjaan]'} di ${company || '[Nama Perusahaan]'}.\n\nMelalui masa studi dan kegiatan akademik, saya telah membangun fondasi keterampilan yang relevan${highlights ? `, khususnya dalam ${highlights}` : ''}. Saya memiliki etos kerja tinggi, kemampuan adaptasi yang cepat, serta siap belajar dan memberikan kontribusi terbaik bagi kemajuan tim.\n\nTerlampir saya sertakan CV dan berkas pendukung sebagai bahan pertimbangan Bapak/Ibu. Besar harapan saya untuk memperoleh kesempatan wawancara agar dapat menjelaskan kualifikasi saya lebih mendalam.\n\nAtas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.\n\nHormat saya,\n${userName || '[Nama Anda]'}`,
  },
  {
    id: 'internship',
    name: 'Magang / PKL',
    badge: 'Siswa / Mahasiswa / PKL',
    description: 'Cocok untuk mahasiswa atau siswa yang ingin mempraktikkan ilmu dalam proyek nyata.',
    icon: Briefcase,
    generate: ({ userName, company, position, recruiterName, highlights }) =>
      `Yth. ${recruiterName || 'Tim Rekrutmen'}\n${company || '[Nama Perusahaan]'}\n\nDengan hormat,\n\nSaya ${userName || '[Nama Anda]'}, bermaksud mengajukan permohonan magang (internship) untuk posisi ${position || '[Posisi Pekerjaan]'} di ${company || '[Nama Perusahaan]'}.\n\nSaya memiliki motivasi tinggi untuk belajar langsung di lingkungan kerja profesional${highlights ? `, dengan ketertarikan dan keterampilan di bidang ${highlights}` : ''}. Saya siap berkomitmen penuh untuk menyelesaikan tugas tim secara proaktif, disiplin, dan bertanggung jawab.\n\nBersama email ini saya lampirkan CV dan portofolio untuk ditinjau. Terima kasih banyak atas waktu dan kesempatan yang diberikan.\n\nHormat saya,\n${userName || '[Nama Anda]'}`,
  },
  {
    id: 'experienced',
    name: 'Berpengalaman',
    badge: 'Profesional Teruji',
    description: 'Menonjolkan rekam jejak hasil kerja nyata, penyelesaian masalah, dan kompetensi.',
    icon: Award,
    generate: ({ userName, company, position, recruiterName, highlights }) =>
      `Kepada Yth. ${recruiterName || 'Hiring Manager'}\n${company || '[Nama Perusahaan]'}\n\nDengan hormat,\n\nMelalui surat ini, saya ${userName || '[Nama Anda]'} bermaksud mengajukan lamaran untuk posisi ${position || '[Posisi Pekerjaan]'} di ${company || '[Nama Perusahaan]'}.\n\nDengan pengalaman kerja sebelumnya, saya telah terbiasa menangani tanggung jawab strategis${highlights ? `, termasuk ${highlights}` : ' dan mencapai target tim secara konsisten'}. Saya yakin kompetensi dan gaya kerja kolaboratif saya dapat memberikan dampak positif langsung bagi kemajuan tim ${company || '[Nama Perusahaan]'}.\n\nSebagai bahan pertimbangan, saya melampirkan berkas CV dan riwayat kerja saya. Saya sangat menantikan kesempatan wawancara untuk mendiskusikan bagaimana kualifikasi saya dapat memenuhi kebutuhan perusahaan.\n\nAtas perhatian Bapak/Ibu, saya sampaikan terima kasih.\n\nHormat saya,\n${userName || '[Nama Anda]'}`,
  },
  {
    id: 'to-the-point',
    name: 'Singkat & Padat',
    badge: 'Langsung Inti (To-The-Point)',
    description: 'Format ringkas yang disukai HRD sibuk: pengantar singkat + lampiran CV.',
    icon: CheckCircle2,
    generate: ({ userName, company, position, recruiterName }) =>
      `Yth. ${recruiterName || 'Tim Rekrutmen'}\n${company || '[Nama Perusahaan]'}\n\nPerkenalkan saya ${userName || '[Nama Anda]'}. Bersama email ini saya menyampaikan minat untuk mengisi posisi ${position || '[Posisi Pekerjaan]'} yang sedang dibuka di ${company || '[Nama Perusahaan]'}.\n\nTerlampir berkas CV dan dokumen portofolio terbaru saya sebagai bahan tinjauan. Saya siap hadir untuk sesi interview atau tahapan seleksi selanjutnya sesuai jadwal yang ditentukan.\n\nTerima kasih atas kesempatan dan perhatian Bapak/Ibu.\n\nHormat saya,\n${userName || '[Nama Anda]'}`,
  },
];

interface SavedCoverLetter {
  id: string;
  company: string;
  position: string;
  date: string;
  content: string;
}

export interface CoverLetterViewProps {
  hideHeader?: boolean;
  initialCompany?: string;
  initialPosition?: string;
  onUseInMailer?: (data: {
    company: string;
    position: string;
    recruiterName?: string;
    content: string;
    cvId?: string;
  }) => void;
}

export interface ExtractedJobData {
  company: string;
  position: string;
  recruiter: string;
  qualifications: string;
  highlights: string;
}

export function extractJobDescriptionEntities(text: string): ExtractedJobData {
  if (!text || !text.trim()) {
    return { company: '', position: '', recruiter: '', qualifications: '', highlights: '' };
  }

  const cleanText = text.trim();
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
  let company = '';
  let position = '';
  let recruiter = '';
  let qualifications = '';

  // 1. Deteksi Nama Perusahaan
  const companyPrefixMatch = cleanText.match(/(?:Perusahaan|Company|Employer|Kantor|Instansi|Nama Perusahaan)\s*[:\-]\s*([^\n\r,]+)/i);
  if (companyPrefixMatch && companyPrefixMatch[1]) {
    company = companyPrefixMatch[1].trim();
  } else {
    const ptMatch = cleanText.match(/\b(PT|CV|UD|Yayasan)\s+([A-Za-z0-9\.\s\-&]+?)(?=\s*(?:\n|\r|,|membuka|is hiring|hiring|sedang|\.|$))/i);
    if (ptMatch && ptMatch[0]) {
      company = ptMatch[0].trim();
    } else {
      const atMatch = cleanText.match(/(?:join us at|we are hiring at|bekerja di|lowongan di|karir di)\s+([A-Z][A-Za-z0-9\s&]{2,35})/i);
      if (atMatch && atMatch[1]) {
        company = atMatch[1].trim();
      } else if (lines.length > 0 && /^(PT|CV|Yayasan)\b/i.test(lines[0])) {
        company = lines[0];
      }
    }
  }

  // 2. Deteksi Posisi Pekerjaan
  const posPrefixMatch = cleanText.match(/(?:Posisi|Position|Role|Jabatan|Lowongan|Job Title|Dibutuhkan)\s*[:\-]\s*([^\n\r]+)/i);
  if (posPrefixMatch && posPrefixMatch[1]) {
    position = posPrefixMatch[1].replace(/^(sebagai|for|urgently needed)\s*/i, '').trim();
  } else {
    const hiringMatch = cleanText.match(/(?:We are hiring|Hiring|Membuka lowongan|Open Position|Recruiting)\s*[:\-]?\s*([^\n\r]+)/i);
    if (hiringMatch && hiringMatch[1] && !hiringMatch[1].toLowerCase().includes('team')) {
      position = hiringMatch[1].trim();
    } else {
      const titleRegex = /\b((?:Senior\s+|Junior\s+|Lead\s+|Associate\s+|Intern\s+)?(?:Software Engineer|Frontend(?: Developer)?|Back-?end(?: Developer)?|Fullstack(?: Developer)?|Web Developer|Mobile Developer|Android Developer|iOS Developer|UI\/UX Designer|Graphic Designer|Product Manager|Project Manager|Data Analyst|Digital Marketing(?: Specialist)?|Social Media(?: Specialist)?|Content Creator|Copywriter|Admin Operasional|Staff Administrasi|Customer Service|Accountant|Accounting Staff|Sales Executive|Business Development|Finance Officer|HR Officer|HRD))\b/i;
      const titleMatch = cleanText.match(titleRegex);
      if (titleMatch && titleMatch[0]) {
        position = titleMatch[0].trim();
      }
    }
  }

  // Fallback nama perusahaan/posisi jika baris awal ringkas
  if (!company && lines.length > 0 && lines[0].length < 40 && !lines[0].includes(':')) {
    if (!position || position.toLowerCase() !== lines[0].toLowerCase()) {
      company = lines[0];
    }
  }

  // 3. Deteksi Recruiter / Kontak
  const recruiterSalutationMatch = cleanText.match(/(?:Yth\.|Bpk\.|Bapak|Ibu|Pak|Mr\.|Ms\.|Mrs\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (recruiterSalutationMatch && recruiterSalutationMatch[0]) {
    recruiter = recruiterSalutationMatch[0].trim();
  } else {
    const picMatch = cleanText.match(/(?:HRD|Hiring Manager|Recruiter|PIC|Contact Person|Kirim CV ke)\s*[:\-]\s*([A-Za-z\s]+?)(?=\s*(?:\(|<|\n|$))/i);
    if (picMatch && picMatch[1] && !picMatch[1].includes('@') && picMatch[1].length < 40) {
      recruiter = picMatch[1].trim();
    }
  }

  // 4. Deteksi Kualifikasi / Syarat
  const qualSectionMatch = cleanText.match(/(?:Kualifikasi|Persyaratan|Requirements|Qualifications|Kriteria|Syarat Lowongan|Kualifikasi Pelamar|Syarat)\s*[:\-]?([\s\S]*?)(?=(?:Deskripsi Pekerjaan|Job Description|Tanggung Jawab|Responsibilities|Benefit|Cara Melamar|Kirim CV|Contact|$))/i);
  if (qualSectionMatch && qualSectionMatch[1] && qualSectionMatch[1].trim().length > 15) {
    qualifications = qualSectionMatch[1].trim();
  } else {
    const bulletLines = lines.filter((l) => /^[•\-\*\d\.]+\s+/.test(l));
    if (bulletLines.length > 0) {
      qualifications = bulletLines.join('\n');
    } else {
      qualifications = lines.length > 2 ? lines.slice(2).join('\n') : cleanText;
    }
  }

  return {
    company: company.replace(/[,\.;]+$/, '').trim(),
    position: position.replace(/[,\.;]+$/, '').trim(),
    recruiter: recruiter.replace(/[,\.;]+$/, '').trim(),
    qualifications: qualifications.trim(),
    highlights: '',
  };
}

const initialSavedLetters: SavedCoverLetter[] = [];

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  hideHeader = false,
  initialCompany = '',
  initialPosition = '',
  onUseInMailer,
}) => {
  const toast = useToast();
  const [savedLetters, setSavedLetters] = useState<SavedCoverLetter[]>(initialSavedLetters);
  const [targetCompany, setTargetCompany] = useState(initialCompany);
  const [targetPosition, setTargetPosition] = useState(initialPosition);
  const [recruiterName, setRecruiterName] = useState('');
  const [experienceHighlights, setExperienceHighlights] = useState('');
  const [tone, setTone] = useState<'Formal (Bahasa Indonesia)' | 'Professional (English)' | 'Persuasif & Antusias'>('Formal (Bahasa Indonesia)');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('fresh-grad');

  // CV & Job Description Alignment States
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [selectedCv, setSelectedCv] = useState<any | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [trackedJobs, setTrackedJobs] = useState<any[]>([]);
  const [isTrackerSearchOpen, setIsTrackerSearchOpen] = useState(false);
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('');
  const trackerDropdownRef = useRef<HTMLDivElement>(null);
  const trackerSearchInputRef = useRef<HTMLInputElement>(null);

  // Full Job Description Extraction Drawer States
  const [isJobDescDrawerOpen, setIsJobDescDrawerOpen] = useState(false);
  const [rawJobDescText, setRawJobDescText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedJobData | null>(null);
  const jobDescTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jobDescDrawerRef = useRef<HTMLDivElement>(null);

  const [isManualEdited, setIsManualEdited] = useState(false);
  const isManualEditedRef = useRef(false);
  const lastCompanyRef = useRef(initialCompany || '[Nama Perusahaan]');
  const lastPositionRef = useRef(initialPosition || '[Posisi Pekerjaan]');
  const lastRecruiterRef = useRef('Bapak/Ibu HRD');

  // Dynamic user name
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [generatedLetter, setGeneratedLetter] = useState(() =>
    COVER_LETTER_PRESETS[0].generate({
      userName: '[Nama Anda]',
      company: initialCompany || '',
      position: initialPosition || '',
      recruiterName: '',
      highlights: '',
    })
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height dinamis mengikuti panjang baris
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 280)}px`;
    }
  }, [generatedLetter]);

  // Helper untuk membentuk surat dari parameter saat ini
  const generateLetterFromParams = (params: {
    company: string;
    position: string;
    recruiter: string;
    highlights: string;
    user?: string;
    presetId?: string | null;
  }) => {
    const activeId = params.presetId !== undefined ? params.presetId : selectedPresetId;
    const preset = COVER_LETTER_PRESETS.find((p) => p.id === (activeId || 'fresh-grad')) || COVER_LETTER_PRESETS[0];
    return preset.generate({
      userName: params.user !== undefined ? params.user : (userName || '[Nama Anda]'),
      company: params.company.trim(),
      position: params.position.trim(),
      recruiterName: params.recruiter.trim(),
      highlights: params.highlights.trim(),
    });
  };

  const handleCompanyChange = (val: string) => {
    setTargetCompany(val);
    if (!isManualEditedRef.current) {
      const next = generateLetterFromParams({
        company: val,
        position: targetPosition,
        recruiter: recruiterName,
        highlights: experienceHighlights,
      });
      setGeneratedLetter(next);
      lastCompanyRef.current = val.trim() || '[Nama Perusahaan]';
    } else {
      const oldToken = lastCompanyRef.current;
      const newToken = val.trim() || '[Nama Perusahaan]';
      if (oldToken && oldToken.length >= 3 && generatedLetter.includes(oldToken)) {
        setGeneratedLetter((prev) => prev.replaceAll(oldToken, newToken));
        lastCompanyRef.current = newToken;
      } else if (generatedLetter.includes('[Nama Perusahaan]')) {
        setGeneratedLetter((prev) => prev.replaceAll('[Nama Perusahaan]', newToken));
        lastCompanyRef.current = newToken;
      }
    }
  };

  const handlePositionChange = (val: string) => {
    setTargetPosition(val);
    if (!isManualEditedRef.current) {
      const next = generateLetterFromParams({
        company: targetCompany,
        position: val,
        recruiter: recruiterName,
        highlights: experienceHighlights,
      });
      setGeneratedLetter(next);
      lastPositionRef.current = val.trim() || '[Posisi Pekerjaan]';
    } else {
      const oldToken = lastPositionRef.current;
      const newToken = val.trim() || '[Posisi Pekerjaan]';
      if (oldToken && oldToken.length >= 3 && generatedLetter.includes(oldToken)) {
        setGeneratedLetter((prev) => prev.replaceAll(oldToken, newToken));
        lastPositionRef.current = newToken;
      } else if (generatedLetter.includes('[Posisi Pekerjaan]')) {
        setGeneratedLetter((prev) => prev.replaceAll('[Posisi Pekerjaan]', newToken));
        lastPositionRef.current = newToken;
      }
    }
  };

  const handleRecruiterChange = (val: string) => {
    setRecruiterName(val);
    if (!isManualEditedRef.current) {
      const next = generateLetterFromParams({
        company: targetCompany,
        position: targetPosition,
        recruiter: val,
        highlights: experienceHighlights,
      });
      setGeneratedLetter(next);
      lastRecruiterRef.current = val.trim() || 'Bapak/Ibu HRD';
    }
  };

  const handleHighlightsChange = (val: string) => {
    setExperienceHighlights(val);
    if (!isManualEditedRef.current) {
      const next = generateLetterFromParams({
        company: targetCompany,
        position: targetPosition,
        recruiter: recruiterName,
        highlights: val,
      });
      setGeneratedLetter(next);
    }
  };

  const handleResetToTemplate = () => {
    isManualEditedRef.current = false;
    setIsManualEdited(false);
    lastCompanyRef.current = targetCompany.trim() || '[Nama Perusahaan]';
    lastPositionRef.current = targetPosition.trim() || '[Posisi Pekerjaan]';
    lastRecruiterRef.current = recruiterName.trim() || 'Bapak/Ibu HRD';
    const next = generateLetterFromParams({
      company: targetCompany,
      position: targetPosition,
      recruiter: recruiterName,
      highlights: experienceHighlights,
    });
    setGeneratedLetter(next);
    toast.success('Disinkronkan Ulang', 'Draf surat berhasil disinkronkan kembali dengan parameter.');
  };

  const handleSelectCv = (cvId: string) => {
    setSelectedCvId(cvId);
    const found = userCvs.find((c) => c.id === cvId);
    setSelectedCv(found || null);

    if (found) {
      const rawData = typeof found.data === 'object' && found.data !== null ? found.data : {};
      const candidateName = rawData.fullName || userName;
      if (candidateName && (!userName || userName === 'Pelamar')) {
        setUserName(candidateName);
      }

      if (!targetPosition && (found.target_position || found.headline || found.title)) {
        handlePositionChange(found.target_position || found.headline || found.title);
      }

      const rawSkills = Array.isArray(rawData.skills) ? rawData.skills : [];
      const skillNames = rawSkills
        .map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
        .filter(Boolean);

      if (skillNames.length > 0 && !experienceHighlights) {
        handleHighlightsChange(`penguasaan dalam ${skillNames.slice(0, 4).join(', ')}`);
      }

      toast.success('CV Terhubung', `CV "${found.title || 'Utama'}" berhasil dihubungkan untuk penyesuaian kualifikasi.`);
    }
  };

  const handleSelectTrackedJob = (app: any) => {
    if (app.company_name) handleCompanyChange(app.company_name);
    if (app.position) handlePositionChange(app.position);
    if (app.notes || app.job_description) {
      setJobDescription(app.notes || app.job_description);
    }
    setIsTrackerSearchOpen(false);
    toast.success('Loker Dimuat dari Tracker', `Data ${app.company_name} berhasil dimuat.`);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setRawJobDescText(text);
          const parsed = extractJobDescriptionEntities(text);
          setExtractedData(parsed);
          toast.success('Teks Loker Ditempel', 'Teks berhasil disalin dari clipboard dan parameter berhasil dideteksi.');
          return;
        }
      }
      toast.info('Clipboard Kosong', 'Silakan tempel teks secara manual dengan tombol Ctrl+V.');
    } catch {
      toast.info('Izin Clipboard Ditolak', 'Silakan tempel teks langsung di kotak teks menggunakan Ctrl+V.');
    }
  };

  const handleRawJobDescChange = (text: string) => {
    setRawJobDescText(text);
    if (text.trim()) {
      const parsed = extractJobDescriptionEntities(text);
      setExtractedData(parsed);
    } else {
      setExtractedData(null);
    }
  };

  const handleApplyExtractedJobDesc = () => {
    if (!extractedData && !rawJobDescText.trim()) return;

    const data = extractedData || extractJobDescriptionEntities(rawJobDescText);
    const newCompany = data.company.trim() || targetCompany;
    const newPosition = data.position.trim() || targetPosition;
    const newRecruiter = data.recruiter.trim() || recruiterName;
    const newQualifications = data.qualifications.trim() || rawJobDescText.trim();

    if (newCompany) handleCompanyChange(newCompany);
    if (newPosition) handlePositionChange(newPosition);
    if (newRecruiter) handleRecruiterChange(newRecruiter);
    if (newQualifications) setJobDescription(newQualifications);

    setIsJobDescDrawerOpen(false);
    toast.success(
      'Job Description Diterapkan',
      'Parameter target loker berhasil diselaraskan dan draf diperbarui secara live.'
    );
  };

  const filteredTrackedJobs = useMemo(() => {
    if (!trackerSearchQuery.trim()) return trackedJobs;
    const q = trackerSearchQuery.toLowerCase().trim();
    return trackedJobs.filter((job) =>
      (job.company_name && job.company_name.toLowerCase().includes(q)) ||
      (job.position && job.position.toLowerCase().includes(q)) ||
      (job.status && job.status.toLowerCase().includes(q))
    );
  }, [trackedJobs, trackerSearchQuery]);

  const cvOptions: SelectOption[] = useMemo(() => {
    return userCvs.map((cv) => ({
      value: cv.id,
      label: `${cv.title || 'CV Siap Kerja'} (${cv.target_position || 'Umum'})`,
    }));
  }, [userCvs]);

  // Click outside & Escape key listeners for tracker search dropdown and drawer
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trackerDropdownRef.current && !trackerDropdownRef.current.contains(e.target as Node)) {
        setIsTrackerSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTrackerSearchOpen(false);
        setIsJobDescDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isTrackerSearchOpen) {
      setTimeout(() => trackerSearchInputRef.current?.focus(), 50);
    }
  }, [isTrackerSearchOpen]);

  useEffect(() => {
    if (isJobDescDrawerOpen) {
      setTimeout(() => jobDescTextareaRef.current?.focus(), 80);
    }
  }, [isJobDescDrawerOpen]);

  const rawCvData = selectedCv && typeof selectedCv.data === 'object' && selectedCv.data !== null ? selectedCv.data : {};
  const selectedCvSkills: string[] = Array.isArray(rawCvData.skills)
    ? rawCvData.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean)
    : (Array.isArray(selectedCv?.skills) ? selectedCv.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean) : []);

  useEffect(() => {
    if (initialCompany && !targetCompany) {
      handleCompanyChange(initialCompany);
    }
    if (initialPosition && !targetPosition) {
      handlePositionChange(initialPosition);
    }
  }, [initialCompany, initialPosition]);

  useEffect(() => {
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        const name = profile.fullName || profile.name || '';
        const email = profile.email || '';
        setUserName(name);
        setUserEmail(email);
        if (!isManualEditedRef.current && name) {
          setGeneratedLetter(
            generateLetterFromParams({
              company: targetCompany,
              position: targetPosition,
              recruiter: recruiterName,
              highlights: experienceHighlights,
              user: name,
            })
          );
        }
      }
    }).catch(() => {});

    // Muat CV pengguna dari database
    cvApi.getAll().then((cvs: any[]) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        setUserCvs(cvs);
        const first = cvs[0];
        setSelectedCvId(first.id);
        setSelectedCv(first);
        if (!targetPosition && (first.target_position || first.headline || first.title)) {
          setTargetPosition(first.target_position || first.headline || first.title);
        }
      }
    }).catch(() => {});

    // Muat daftar lowongan dari Job Tracker
    trackerApi.getAll().then((apps: any[]) => {
      if (Array.isArray(apps) && apps.length > 0) {
        setTrackedJobs(apps);
      }
    }).catch(() => {});

    // Muat dari database, lalu migrasikan data lama di localStorage (sekali saja)
    const loadLetters = async () => {
      const remote = await coverLetterApi.getAll();
      if (Array.isArray(remote)) {
        setSavedLetters(remote as SavedCoverLetter[]);
      } else {
        setSavedLetters([]);
      }
    };

    loadLetters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany || !targetPosition) return;

    setIsGenerating(true);
    try {
      const languageInstruction = tone === 'Professional (English)'
        ? 'Tulis dalam Bahasa Inggris profesional tingkat native.'
        : tone === 'Persuasif & Antusias'
          ? 'Tulis dalam Bahasa Indonesia dengan gaya persuasif, energik, dan antusias namun tetap sopan dan profesional.'
          : 'Tulis dalam Bahasa Indonesia formal, elegan, dan profesional.';

      // Extract comprehensive CV context
      const cvRaw = selectedCv && typeof selectedCv.data === 'object' && selectedCv.data !== null ? selectedCv.data : {};
      const cvSkills = selectedCvSkills;
      const cvExperiences = Array.isArray(cvRaw.experience) ? cvRaw.experience : (Array.isArray(cvRaw.experiences) ? cvRaw.experiences : []);
      const expSummary = cvExperiences.map((e: any) => `${e.role || e.position || ''} di ${e.company || ''}: ${e.description || (e.bullets ? e.bullets.join(', ') : '')}`).slice(0, 3).join('; ');

      const prompt = `Buatlah Surat Lamaran Kerja (Cover Letter) yang SANGAT TERPERSONALISASI, profesional, dan siap kirim berdasarkan data pelamar dan persyaratan lowongan berikut:

DATA PELAMAR (DARI CV):
- Nama Pelamar: ${userName || cvRaw.fullName || 'Kandidat'}
- Email: ${userEmail || cvRaw.email || 'email@email.com'}
- Posisi Sasaran CV: ${selectedCv?.target_position || selectedCv?.title || targetPosition}
- Keahlian Utama (Skills di CV): ${cvSkills.length > 0 ? cvSkills.join(', ') : (experienceHighlights || 'Keahlian profesional relevan')}
- Ringkasan Pengalaman Kerja / Proyek: ${expSummary || experienceHighlights || 'Pengalaman kerja dan rekam jejak relevan'}
- Ringkasan Profil: ${cvRaw.summary || cvRaw.about || '-'}

DATA LOWONGAN:
- Perusahaan Tujuan: ${targetCompany}
- Posisi yang Dilamar: ${targetPosition}
- Nama Recruiter / Hiring Manager: ${recruiterName || 'Tim Rekrutmen'}
- PERSYARATAN & KUALIFIKASI LOWONGAN (JOB DESCRIPTION):
${jobDescription ? jobDescription : '(Kandidat melamar untuk posisi ' + targetPosition + ')'}
- Highlight Tambahan Pelamar: ${experienceHighlights || 'Kandidat memiliki motivasi tinggi, etos kerja kuat, dan cepat beradaptasi.'}
- Gaya / Nada Bahasa: ${tone}

PANDUAN PENULISAN:
1. ${languageInstruction}
2. BUKTI KECOCOKAN KUALIFIKASI: Hubungkan secara spesifik 2-3 kualifikasi/syarat yang diminta di JOB DESCRIPTION dengan keahlian (skills) atau pengalaman nyata yang ada di DATA CV PELAMAR. Tunjukkan mengapa pelamar adalah kandidat yang tepat dan siap berkontribusi.
3. HINDARI SURAT GENERIK: Jangan menggunakan template hambar atau klise umum. Tulis seolah kandidat telah mempelajari deskripsi lowongan perusahaan secara mendalam.
4. Format surat 3-4 paragraf padat & jelas: pembuka minat profesional, 1-2 paragraf bukti kompetensi berbasis JD, dan penutup ajakan wawancara.
5. Kembalikan HANYA teks isi surat lamaran lengkap, tanpa markdown code block, tanpa penjelasan pembuka atau penutup.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'cover_letter',
          task: 'cover_letter',
          promptName: 'Cover Letter Generator',
          prompt,
        }),
      });

      if (!res.ok) throw new Error(`AI API error ${res.status}`);
      const json = await res.json();
      if (!json.text) throw new Error('Empty AI response');

      const cleanedText = json.text.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
      setGeneratedLetter(cleanedText);
      isManualEditedRef.current = true;
      setIsManualEdited(true);
      lastCompanyRef.current = targetCompany.trim() || '[Nama Perusahaan]';
      lastPositionRef.current = targetPosition.trim() || '[Posisi Pekerjaan]';
    } catch (err) {
      console.warn('[CoverLetterView AI error, fallback]:', err);
      // Clean dynamic fallback without hardcoded React/IT stack
      if (tone === 'Professional (English)') {
        setGeneratedLetter(`Dear ${recruiterName || 'Hiring Team'} at ${targetCompany || '[Target Company]'},

I am writing to express my strong interest in the ${targetPosition || '[Target Position]'} role at ${targetCompany || '[Target Company]'}. Based on my background in ${selectedCvSkills.slice(0, 3).join(', ') || experienceHighlights || 'delivering high-quality results'}, I am confident in my ability to meet the requirements of your team and contribute meaningfully.

Having reviewed your job requirements, my core competencies and practical experience align closely with the responsibilities of this position. I am dedicated to continuous learning, collaborative problem-solving, and driving excellence.

Thank you for your time and consideration. I would welcome the opportunity to discuss my qualifications further in an interview.

Sincerely,
${userName || 'Kandidat'}
${userEmail || 'email@email.com'}`);
      } else {
        setGeneratedLetter(`Kepada Yth. ${recruiterName || 'Tim Rekrutmen'}
${targetCompany || '[Nama Perusahaan]'}

Dengan hormat,

Melalui surat lamaran ini, saya bermaksud menyampaikan minat profesional saya untuk bergabung bersama ${targetCompany || '[Nama Perusahaan]'} pada posisi ${targetPosition || '[Posisi Pekerjaan]'}. Berdasarkan kualifikasi yang dibutuhkan dan keahlian yang saya miliki${selectedCvSkills.length > 0 ? `, khususnya dalam ${selectedCvSkills.slice(0, 3).join(', ')}` : ''}, saya siap memberikan kontribusi nyata bagi kemajuan tim.

Secara khusus, pengalaman saya meliputi ${experienceHighlights || (selectedCvSkills.length > 0 ? `penguasaan dalam ${selectedCvSkills.join(', ')}` : 'pelaksanaan tanggung jawab secara terstruktur, pemecahan masalah, dan kolaborasi tim')}. Saya berkomitmen membawa etos kerja tinggi dan dedikasi penuh untuk mendukung visi ${targetCompany || '[Nama Perusahaan]'}.

Besar harapan saya untuk mendapatkan kesempatan menghadiri sesi wawancara guna mendiskusikan kualifikasi saya lebih mendalam. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.

Hormat saya,
${userName || 'Kandidat'}
${userEmail || 'email@email.com'}`);
      }
      isManualEditedRef.current = true;
      setIsManualEdited(true);
      lastCompanyRef.current = targetCompany.trim() || '[Nama Perusahaan]';
      lastPositionRef.current = targetPosition.trim() || '[Posisi Pekerjaan]';
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedLetter) return;
    const created = await coverLetterApi.create({
      company: targetCompany || 'Perusahaan Target',
      position: targetPosition || 'Posisi Pekerjaan',
      recruiter: recruiterName || undefined,
      tone: tone || undefined,
      content: generatedLetter,
    });
    if (created) {
      setSavedLetters((prev) => [created as SavedCoverLetter, ...prev]);
      toast.success('Surat Lamaran Tersimpan', 'Surat lamaran berhasil disimpan ke daftar dokumen kamu.');
    } else {
      toast.error('Gagal Menyimpan', 'Surat lamaran tidak berhasil disimpan. Coba lagi.');
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      const ok = await coverLetterApi.delete(id);
      if (ok) {
        setSavedLetters((prev) => prev.filter((l) => l.id !== id));
        toast.success('Surat Lamaran Dihapus', 'Draf surat lamaran berhasil dihapus.');
      } else {
        toast.error('Gagal Menghapus', 'Surat lamaran tidak berhasil dihapus. Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal Menghapus', 'Terjadi kesalahan sistem saat menghapus surat lamaran.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standardized */}
      {!hideHeader && (
        <PageHeader
          title="Pembuat Surat Lamaran"
          subtitle="Susun surat lamaran kerja persuasif secara instan dengan template profesional. Kamu bisa menyalin teks secara manual atau langsung kirim via pengirim otomatis."
          icon={Mail}
          badge="Penyelaras Lamaran"
          stats={[
            { label: 'Tersimpan', value: `${savedLetters.length} Draf`, icon: FileText, isPrimary: true },
          ]}
        />
      )}

      {/* Alur Kerja Cerdas: Siapkan Email -> Manual / Kirim Otomatis */}
      <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[10px] text-caption font-extrabold bg-cobalt-500 text-white">
              Langkah 1
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Siapkan Draf Surat Lamaran / Isi Email
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pilih template cepat di bawah atau susun secara cerdas. Kamu cukup klik <strong>Salin Teks</strong> untuk kirim manual, atau klik <strong>Lanjut Kirim Otomatis</strong> untuk kirim instan ke HRD.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-caption text-slate-500 hidden sm:inline">Pilihan kamu:</span>
          <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Salin Bebas (Manual)
          </span>
          <span className="text-slate-500 text-xs dark:text-slate-400">/</span>
          <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Kirim Otomatis
          </span>
        </div>
      </div>

      {/* Pilihan Template Cepat Siap Pakai */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
            <span>Pilih Template Siap Pakai (1-Klik Jadi)</span>
          </h4>
          <span className="text-caption text-slate-500 hidden sm:inline">
            Langsung tampil & bisa diedit di editor sebelah kanan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COVER_LETTER_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  isManualEditedRef.current = false;
                  setIsManualEdited(false);
                  lastCompanyRef.current = targetCompany.trim() || '[Nama Perusahaan]';
                  lastPositionRef.current = targetPosition.trim() || '[Posisi Pekerjaan]';
                  lastRecruiterRef.current = recruiterName.trim() || 'Bapak/Ibu HRD';
                  const letter = preset.generate({
                    userName: userName || '[Nama Anda]',
                    company: targetCompany.trim(),
                    position: targetPosition.trim(),
                    recruiterName: recruiterName.trim(),
                    highlights: experienceHighlights.trim(),
                  });
                  setGeneratedLetter(letter);
                  toast.success('Template Dimuat', `Template ${preset.name} berhasil dimuat ke editor.`);
                }}
                className={`p-3.5 rounded-[10px] text-left transition border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-cobalt-500 shadow-xs ring-1 ring-cobalt-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-cobalt-500 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-caption font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {preset.badge.split('/')[0].trim()}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </h5>
                  <p className="text-caption text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-caption font-bold text-cobalt-500 dark:text-blue-400">
                  <span>Gunakan Template</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Generator Left */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-orange-700 shrink-0 dark:text-orange-400" />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Kustomisasi Parameter Surat
                </h3>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Sesuaikan manual, atau tempel seluruh teks loker untuk pengisian otomatis.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsJobDescDrawerOpen(true)}
              className="px-3.5 py-2.5 min-h-[44px] rounded-[10px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-cobalt-500 dark:text-blue-400 font-bold text-sm sm:text-xs border border-blue-200/80 dark:border-blue-800/80 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.98]"
              title="Tempel seluruh isi postingan loker untuk mengisi form otomatis"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Tempel Teks Loker</span>
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            {/* 1. Pilih CV Pelamar (Basis Kualifikasi) */}
            <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400" />
                  <span>Pilih CV Saya (Basis Kualifikasi)</span>
                </label>
                {userCvs.length > 0 && (
                  <span className="text-caption text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    PDF Disiapkan Otomatis
                  </span>
                )}
              </div>

              {userCvs.length > 0 ? (
                <CustomSelect
                  value={selectedCvId}
                  onChange={(val) => handleSelectCv(val)}
                  options={cvOptions}
                  placeholder="Pilih CV Saya..."
                />
              ) : (
                <div className="text-caption text-slate-500 flex items-center justify-between py-1">
                  <span>Belum ada CV di akunmu.</span>
                  <Link href="/cv" className="px-3 py-2 min-h-[44px] rounded-[8px] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-cobalt-500 dark:text-blue-400 font-bold inline-flex items-center gap-1 transition">
                    Buat CV <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Tampilkan Skills dari CV Terpilih */}
              {selectedCvSkills.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Keahlian di CV yang akan dijodohkan:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCvSkills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-[6px] text-caption font-medium bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedCvSkills.length > 6 && (
                      <span className="text-caption text-slate-500 px-1 py-0.5 dark:text-slate-400">
                        +{selectedCvSkills.length - 6} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Perusahaan Target & Tombol Ambil dari Tracker */}
            <div ref={trackerDropdownRef} className="relative">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="cover-letter-company-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Perusahaan Target *
                </label>
                {trackedJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTrackerSearchOpen(!isTrackerSearchOpen);
                      setTrackerSearchQuery('');
                    }}
                    className={`text-xs font-bold px-3 py-2 min-h-[44px] sm:min-h-[36px] rounded-[10px] transition flex items-center gap-1.5 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      isTrackerSearchOpen
                        ? 'bg-cobalt-500 text-white border-cobalt-500 shadow-xs'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                    }`}
                    aria-expanded={isTrackerSearchOpen}
                    aria-haspopup="dialog"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Ambil dari Tracker ({trackedJobs.length})</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTrackerSearchOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              <input
                id="cover-letter-company-input"
                type="text"
                required
                placeholder="Contoh: PT Shopee Indonesia"
                value={targetCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />

              {/* Search Dropdown Popover */}
              {isTrackerSearchOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 p-3 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-2.5 animate-in fade-in-80 zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                      Pilih dari Tracker
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTrackerSearchOpen(false)}
                      className="text-caption font-medium text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer dark:text-slate-400"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* Search Input Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-slate-400" />
                    <input
                      ref={trackerSearchInputRef}
                      type="text"
                      placeholder="Cari perusahaan atau posisi di Tracker..."
                      value={trackerSearchQuery}
                      onChange={(e) => setTrackerSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-9 py-2.5 min-h-[44px] text-sm sm:text-xs rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:bg-white dark:focus:bg-slate-900 transition"
                    />
                    {trackerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTrackerSearchQuery('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center p-1 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer dark:text-slate-400"
                        aria-label="Bersihkan pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtered Tracked Jobs List */}
                  <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                    {filteredTrackedJobs.length > 0 ? (
                      filteredTrackedJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleSelectTrackedJob(job)}
                          className="w-full text-left p-2.5 min-h-[48px] rounded-[8px] bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/80 transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cobalt-500 dark:group-hover:text-blue-400 block truncate">
                              {job.company_name}
                            </span>
                            <span className="text-caption text-slate-500 dark:text-slate-400 block truncate">
                              {job.position || 'Posisi tidak disebutkan'}
                            </span>
                          </div>
                          {job.status && (
                            <span className="text-caption font-bold px-2 py-0.5 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              {job.status}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada loker di Tracker yang cocok dengan "{trackerSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Posisi Pekerjaan */}
            <div>
              <label htmlFor="cover-letter-position-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Posisi Pekerjaan *
              </label>
              <input
                id="cover-letter-position-input"
                type="text"
                required
                placeholder="Contoh: Senior Frontend Developer"
                value={targetPosition}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />
            </div>

            {/* 4. Deskripsi / Kualifikasi Lowongan (Job Description) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="cover-letter-job-desc-textarea" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <Briefcase className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                  <span>Kualifikasi Loker (Deskripsi Posisi)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (jobDescription && !rawJobDescText) {
                        setRawJobDescText(jobDescription);
                        setExtractedData(extractJobDescriptionEntities(jobDescription));
                      }
                      setIsJobDescDrawerOpen(true);
                    }}
                    className="px-2.5 py-1.5 min-h-[44px] rounded-[8px] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-caption font-bold text-cobalt-500 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Tempel Lengkap</span>
                  </button>
                  <span className="text-caption text-slate-500 dark:text-slate-400">Direkomendasikan</span>
                </div>
              </div>
              <textarea
                id="cover-letter-job-desc-textarea"
                rows={3}
                placeholder="Tempel syarat/kualifikasi dari poster loker (misal: Minimal S1, menguasai React/TypeScript, komunikatif)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 min-h-[80px] text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-caption text-slate-500">
                  Sistem menyelaraskan syarat lowongan ini dengan keahlian di CV-mu.
                </p>
                {jobDescription.length > 40 && (!targetCompany || !targetPosition) && (
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = extractJobDescriptionEntities(jobDescription);
                      if (parsed.company && !targetCompany) handleCompanyChange(parsed.company);
                      if (parsed.position && !targetPosition) handlePositionChange(parsed.position);
                      if (parsed.recruiter && !recruiterName) handleRecruiterChange(parsed.recruiter);
                      toast.success('Parameter Terdeteksi', 'Nama perusahaan dan posisi berhasil diekstrak dari teks loker.');
                    }}
                    className="text-caption font-bold text-cobalt-500 dark:text-blue-400 hover:underline shrink-0 cursor-pointer min-h-[44px] sm:min-h-0 inline-flex items-center"
                  >
                    Deteksi & Isi Form
                  </button>
                )}
              </div>
            </div>

            {/* 5. Nama Recruiter */}
            <div>
              <label htmlFor="cover-letter-recruiter-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Recruiter (Opsional)
              </label>
              <input
                id="cover-letter-recruiter-input"
                type="text"
                placeholder="Contoh: Ibu Rina Hartati"
                value={recruiterName}
                onChange={(e) => handleRecruiterChange(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />
            </div>

            {/* 6. Gaya Bahasa */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Gaya Bahasa / Tone
              </label>
              <CustomSelect
                value={tone}
                onChange={(val) => setTone(val as any)}
                options={[
                  'Formal (Bahasa Indonesia)',
                  'Professional (English)',
                  'Persuasif & Antusias',
                ]}
              />
            </div>

            {/* 7. Highlight Pengalaman Kunci */}
            <div>
              <label htmlFor="cover-letter-highlights-textarea" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Highlight Pengalaman Kunci (Opsional)
              </label>
              <textarea
                id="cover-letter-highlights-textarea"
                rows={2}
                placeholder="Sebutkan prestasi utama atau portofolio khusus yang ingin ditekankan..."
                value={experienceHighlights}
                onChange={(e) => handleHighlightsChange(e.target.value)}
                className="w-full p-3 min-h-[64px] text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-sm sm:text-xs shadow-md shadow-cobalt-500/20 transition flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Menyelaraskan CV ⟷ Loker...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Susun Surat Lamaran Cerdas</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Result Right */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs flex flex-col space-y-4 h-fit">
          <div>
            {/* Header Hasil Susunan Surat */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-orange-700 shrink-0 dark:text-orange-400" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      Hasil Susunan Surat
                    </h3>
                    {!isManualEdited ? (
                      <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap shrink-0">
                        Live Sinkron
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                          Diedit Manual
                        </span>
                        <button
                          type="button"
                          onClick={handleResetToTemplate}
                          className="text-caption font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer min-h-[44px] sm:min-h-0 inline-flex items-center"
                        >
                          Sinkronkan Ulang
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                    Draf surat siap disalin atau diedit langsung.
                  </p>
                </div>
              </div>

              {/* Quick Copy Shortcut in Header */}
              {generatedLetter && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-[8px] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  title="Salin teks ke clipboard"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Cepat</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-3">
              <textarea
                id="cover-letter-editor-content"
                aria-label="Editor Isi Surat Lamaran"
                ref={textareaRef}
                value={generatedLetter}
                onChange={(e) => {
                  isManualEditedRef.current = true;
                  setIsManualEdited(true);
                  setGeneratedLetter(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.max(e.target.scrollHeight, 280)}px`;
                }}
                placeholder="Pilih template cepat di atas atau isi formulir di samping, lalu teks surat lamaran akan tampil di sini dan siap kamu edit secara bebas..."
                className="w-full p-4 rounded-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm sm:text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cobalt-500 resize-none overflow-hidden"
              />
            </div>

            {generatedLetter && (
              <div className="mt-2.5 space-y-3">
                <div className="flex items-center justify-between text-caption text-slate-500 dark:text-slate-400">
                  <span>Teks di atas dapat langsung kamu ketik/edit sesuai kebutuhan.</span>
                  <span className="font-mono">{generatedLetter.length} karakter</span>
                </div>

                {selectedCv && (
                  <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-caption flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <FileCheck2 className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0" />
                      <span>
                        CV Terhubung: <strong className="font-bold text-slate-900 dark:text-white">{selectedCv.title || 'CV Utama'}</strong>
                        {selectedCv.target_position ? ` (${selectedCv.target_position})` : ''}
                      </span>
                    </div>
                    <span className="text-caption text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      Auto-Attach PDF ATS Aktif
                    </span>
                  </div>
                )}

                {/* Toolbar Aksi Terpadu (Action Toolbar di Bawah Surat) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-[10px] text-sm sm:text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                      title="Salin ke clipboard untuk kirim manual via Gmail atau aplikasi lain"
                    >
                      {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin Teks (Manual)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToLibrary}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-[10px] text-sm sm:text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simpan Draf</span>
                    </button>
                  </div>

                  {onUseInMailer ? (
                    <button
                      type="button"
                      onClick={() =>
                        onUseInMailer({
                          company: targetCompany,
                          position: targetPosition,
                          recruiterName,
                          content: generatedLetter,
                          cvId: selectedCvId || undefined,
                        })
                      }
                      className="px-4 py-2.5 min-h-[44px] rounded-[10px] text-sm sm:text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cobalt-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Lanjut Kirim Otomatis</span>
                    </button>
                  ) : (
                    <Link
                      href={`/mailer?cvId=${selectedCvId || ''}`}
                      className="px-4 py-2.5 min-h-[44px] rounded-[10px] text-sm sm:text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cobalt-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 no-underline"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Lanjut Kirim Otomatis</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Cover Letters List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-700 dark:text-orange-400" />
            Daftar Surat Lamaran Tersimpan ({savedLetters.length})
          </h3>
          <span className="text-caption text-slate-500">
            Dapat disalin langsung atau dimuat ke editor kapan saja
          </span>
        </div>

        {savedLetters.length === 0 ? (
          <div className="p-8 text-center rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs dark:text-slate-400">
            Belum ada surat lamaran yang disimpan. Buat surat baru dan klik &quot;Simpan Draf&quot; untuk menyimpannya di sini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedLetters.map((letter) => (
              <div
                key={letter.id}
                className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {letter.position}
                    </h4>
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                      {letter.company}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(letter.id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[8px] text-slate-500 hover:text-rose-600 cursor-pointer transition dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus"
                    aria-label="Hapus surat lamaran tersimpan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-caption text-slate-600 dark:text-slate-400 line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-[10px] border border-slate-100 dark:border-slate-800 font-sans leading-relaxed">
                  {letter.content}
                </p>

                <div className="flex items-center justify-between text-caption text-slate-500 pt-1 dark:text-slate-400">
                  <span>Diperbarui: {letter.date}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCompany(letter.company);
                        setTargetPosition(letter.position);
                        setGeneratedLetter(letter.content);
                        isManualEditedRef.current = true;
                        setIsManualEdited(true);
                        lastCompanyRef.current = letter.company || '[Nama Perusahaan]';
                        lastPositionRef.current = letter.position || '[Posisi Pekerjaan]';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        toast.success('Draf Dimuat', 'Surat lamaran dimuat ke editor.');
                      }}
                      className="px-3 py-2 min-h-[44px] sm:min-h-[34px] rounded-[8px] text-xs font-bold bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(letter.content);
                        toast.success('Teks Tersalin', 'Surat lamaran berhasil disalin ke clipboard!');
                      }}
                      className="px-3 py-2 min-h-[44px] sm:min-h-[34px] rounded-[8px] text-xs font-bold bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </button>
                    {onUseInMailer && (
                      <button
                        type="button"
                        onClick={() =>
                          onUseInMailer({
                            company: letter.company,
                            position: letter.position,
                            content: letter.content,
                          })
                        }
                        className="px-3 py-2 min-h-[44px] sm:min-h-[34px] rounded-[8px] text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim Otomatis</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right-Hand Slide-in Drawer: Tempel Seluruh Job Description */}
      <Sheet
        open={isJobDescDrawerOpen}
        onOpenChange={setIsJobDescDrawerOpen}
      >
        <SheetContent
          side="right"
          hideCloseButton
          className="w-full max-w-md sm:max-w-xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <SheetHeader className="flex flex-row items-center gap-2.5 space-y-0 text-left">
              <span className="w-8 h-8 rounded-[8px] bg-cobalt-500 text-white flex items-center justify-center shadow-xs">
                <ClipboardPaste className="w-4 h-4 text-orange-400" />
              </span>
              <div>
                <SheetTitle className="font-bold text-sm text-slate-900 dark:text-white">
                  Tempel Teks Loker Lengkap
                </SheetTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deteksi nama perusahaan, posisi, dan syarat lowongan secara otomatis.
                </p>
              </div>
            </SheetHeader>
            <button
              type="button"
              onClick={() => setIsJobDescDrawerOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[8px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer dark:text-slate-400"
              aria-label="Tutup Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

            {/* Drawer Body (Scrollable) */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Helper info & Clipboard button */}
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="job-desc-full-textarea" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Teks Lengkap Lowongan Kerja
                </label>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline min-h-[44px] sm:min-h-0 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Tempel dari Clipboard</span>
                </button>
              </div>

              {/* Big Textarea */}
              <div className="relative">
                <textarea
                  id="job-desc-full-textarea"
                  ref={jobDescTextareaRef}
                  rows={8}
                  value={rawJobDescText}
                  onChange={(e) => handleRawJobDescChange(e.target.value)}
                  placeholder="Salin dan tempel seluruh teks postingan loker di sini (dari LinkedIn, Jobstreet, Glints, poster WA, dll)...&#10;&#10;Contoh:&#10;PT Bintang Teknologi Solusindo&#10;Posisi: Front-End Web Developer&#10;Kualifikasi:&#10;- Minimal 1 tahun pengalaman React / Next.js&#10;- Paham TypeScript dan Tailwind CSS&#10;Kirim lamaran ke: Ibu Maya (hrd@bintangtekno.com)"
                  className="w-full p-3.5 text-sm sm:text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:bg-white dark:focus:bg-slate-900 transition leading-relaxed resize-y"
                />
                {rawJobDescText && (
                  <button
                    type="button"
                    onClick={() => {
                      setRawJobDescText('');
                      setExtractedData(null);
                    }}
                    className="absolute right-2.5 top-2.5 px-3 py-1.5 min-h-[36px] rounded-[6px] text-caption font-bold text-slate-500 hover:text-rose-500 bg-white/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    Bersihkan
                  </button>
                )}
              </div>

              {/* Live Extraction Preview Panel */}
              {extractedData && (
                <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      Hasil Deteksi Loker
                    </span>
                    <span className="text-caption font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[6px] border border-emerald-200 dark:border-emerald-800">
                      Terdeteksi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-caption font-bold text-slate-500 block mb-0.5 uppercase tracking-wider dark:text-slate-400">
                        Perusahaan:
                      </span>
                      <input
                        type="text"
                        value={extractedData.company}
                        onChange={(e) => setExtractedData({ ...extractedData, company: e.target.value })}
                        placeholder="Tidak terdeteksi (isi manual)"
                        className="w-full px-3 py-2 min-h-[44px] rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm sm:text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                      />
                    </div>

                    <div>
                      <span className="text-caption font-bold text-slate-500 block mb-0.5 uppercase tracking-wider dark:text-slate-400">
                        Posisi:
                      </span>
                      <input
                        type="text"
                        value={extractedData.position}
                        onChange={(e) => setExtractedData({ ...extractedData, position: e.target.value })}
                        placeholder="Tidak terdeteksi (isi manual)"
                        className="w-full px-3 py-2 min-h-[44px] rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm sm:text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                      />
                    </div>

                    <div>
                      <span className="text-caption font-bold text-slate-500 block mb-0.5 uppercase tracking-wider dark:text-slate-400">
                        Recruiter / HR:
                      </span>
                      <input
                        type="text"
                        value={extractedData.recruiter}
                        onChange={(e) => setExtractedData({ ...extractedData, recruiter: e.target.value })}
                        placeholder="Opsional (misal: Ibu Maya)"
                        className="w-full px-3 py-2 min-h-[44px] rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm sm:text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                      />
                    </div>

                    <div>
                      <span className="text-caption font-bold text-slate-500 block mb-0.5 uppercase tracking-wider dark:text-slate-400">
                        Status Ekstraksi:
                      </span>
                      <div className="py-2 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                        {extractedData.qualifications ? `${extractedData.qualifications.length} karakter kualifikasi` : 'Hanya info perusahaan/posisi'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-caption font-bold text-slate-500 block mb-1 uppercase tracking-wider dark:text-slate-400">
                      Ringkasan Syarat / Kualifikasi:
                    </span>
                    <textarea
                      rows={3}
                      value={extractedData.qualifications}
                      onChange={(e) => setExtractedData({ ...extractedData, qualifications: e.target.value })}
                      placeholder="Poin-poin kualifikasi loker..."
                      className="w-full p-2.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm sm:text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsJobDescDrawerOpen(false)}
                className="min-h-[44px] px-4 text-sm sm:text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!rawJobDescText.trim()}
                onClick={handleApplyExtractedJobDesc}
                className="min-h-[44px] px-4 text-sm sm:text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terapkan ke Parameter Surat</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
    </div>
  );
};
