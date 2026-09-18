'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { CustomSelect } from '@/components/ui/CustomSelect';
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
    icon: Zap,
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
  const [showTrackerSelector, setShowTrackerSelector] = useState(false);

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
    setShowTrackerSelector(false);
    toast.success('Lowongan Dimuat dari Tracker', `Data lowongan ${app.company_name} berhasil dimuat.`);
  };

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
      if (Array.isArray(remote) && remote.length > 0) {
        setSavedLetters(remote as SavedCoverLetter[]);
        // Migrasi: push sisa data localStorage ke DB, lalu bersihkan
        try {
          const stored = localStorage.getItem('employr_saved_cover_letters');
          if (stored) {
            const localList: SavedCoverLetter[] = JSON.parse(stored);
            if (Array.isArray(localList) && localList.length > 0) {
              const remoteKeys = new Set(remote.map((r: any) => `${r.company}|${r.position}|${r.content}`));
              for (const l of localList) {
                const key = `${l.company}|${l.position}|${l.content}`;
                if (!remoteKeys.has(key)) {
                  await coverLetterApi.create({
                    company: l.company,
                    position: l.position,
                    content: l.content,
                  });
                }
              }
              localStorage.removeItem('employr_saved_cover_letters');
              const refreshed = await coverLetterApi.getAll();
              if (Array.isArray(refreshed)) setSavedLetters(refreshed as SavedCoverLetter[]);
            }
          }
        } catch (e) {
          // Abaikan kegagalan migrasi localStorage
        }
        return;
      }

      // DB kosong: coba migrasi penuh dari localStorage
      try {
        const stored = localStorage.getItem('employr_saved_cover_letters');
        if (stored) {
          const localList: SavedCoverLetter[] = JSON.parse(stored);
          if (Array.isArray(localList) && localList.length > 0) {
            for (const l of localList) {
              await coverLetterApi.create({
                company: l.company,
                position: l.position,
                content: l.content,
              });
            }
            localStorage.removeItem('employr_saved_cover_letters');
            const refreshed = await coverLetterApi.getAll();
            if (Array.isArray(refreshed)) setSavedLetters(refreshed as SavedCoverLetter[]);
            return;
          }
        }
      } catch (e) {
        // Abaikan kegagalan migrasi localStorage
      }
      setSavedLetters([]);
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
          promptName: 'Cover Letter AI Generator',
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
    const ok = await coverLetterApi.delete(id);
    if (ok) {
      setSavedLetters((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header Standardized */}
      {!hideHeader && (
        <PageHeader
          title="Pembuat Surat Lamaran"
          subtitle="Susun surat lamaran kerja persuasif secara instan dengan template profesional atau bantuan AI. Kamu bisa menyalin teks secara manual atau langsung kirim via bot pengirim."
          icon={Mail}
          badge="Cover Letter AI"
          stats={[
            { label: 'Tersimpan', value: `${savedLetters.length} Draf`, icon: FileText },
          ]}
        />
      )}

      {/* Alur Kerja Cerdas: Siapkan Email -> Manual / Bot */}
      <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-[#1738D1] text-white">
              Langkah 1
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Siapkan Draf Surat Lamaran / Isi Email
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pilih template cepat di bawah atau susun otomatis. Jika tidak ingin pakai bot, kamu cukup klik <strong>Salin Teks</strong> untuk kirim manual. Atau klik <strong>Lanjut Kirim via Bot</strong> untuk kirim instan ke HRD.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Pilihan kamu:</span>
          <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Salin Bebas (Manual)
          </span>
          <span className="text-slate-400 text-xs">/</span>
          <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Kirim Otomatis (Bot)
          </span>
        </div>
      </div>

      {/* Pilihan Template Cepat Siap Pakai */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Pilih Template Siap Pakai (1-Klik Jadi)</span>
          </h4>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
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
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-[#1738D1] shadow-xs ring-1 ring-[#1738D1]'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-[#1738D1] dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {preset.badge.split('/')[0].trim()}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-[#1738D1] dark:text-blue-400">
                  <span>Gunakan Template</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Generator Left */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Kustomisasi Parameter Surat
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ketik nama perusahaan & posisi di bawah untuk merubah draf di sebelah kanan secara live, atau susun otomatis via AI.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            {/* 1. Pilih CV Pelamar (Basis Kualifikasi) */}
            <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
                  <span>Pilih CV Saya (Basis Kualifikasi)</span>
                </label>
                {userCvs.length > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Auto-Attach PDF
                  </span>
                )}
              </div>

              {userCvs.length > 0 ? (
                <select
                  value={selectedCvId}
                  onChange={(e) => handleSelectCv(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                >
                  {userCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title || 'CV Siap Kerja'} ({cv.target_position || 'Umum'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[11px] text-slate-500 flex items-center justify-between py-1">
                  <span>Belum ada CV di akunmu.</span>
                  <Link href="/cv" className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                    Buat CV <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Tampilkan Skills dari CV Terpilih */}
              {selectedCvSkills.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Keahlian di CV yang akan dijodohkan:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCvSkills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-[6px] text-[10px] font-medium bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedCvSkills.length > 6 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{selectedCvSkills.length - 6} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Perusahaan Target & Tombol Ambil dari Tracker */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Perusahaan Target *
                </label>
                {trackedJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTrackerSelector(!showTrackerSelector)}
                    className="text-[11px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>Ambil dari Tracker ({trackedJobs.length})</span>
                  </button>
                )}
              </div>

              {/* Tracker Selector Dropdown */}
              {showTrackerSelector && (
                <div className="mb-2 p-2.5 rounded-[8px] bg-blue-50/70 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Pilih lowongan dari Job Tracker:</span>
                    <button
                      type="button"
                      onClick={() => setShowTrackerSelector(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {trackedJobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => handleSelectTrackedJob(job)}
                        className="w-full text-left p-1.5 rounded-[6px] text-[11px] bg-white dark:bg-slate-900 hover:bg-blue-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-bold truncate">{job.company_name}</span>
                        <span className="text-slate-500 truncate ml-2 text-[10px]">{job.position}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="text"
                required
                placeholder="Contoh: PT Shopee Indonesia"
                value={targetCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            {/* 3. Posisi Pekerjaan */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Posisi Pekerjaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Senior Frontend Developer"
                value={targetPosition}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            {/* 4. Deskripsi / Kualifikasi Lowongan (Job Description) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                  <span>Kualifikasi Lowongan (Job Description)</span>
                </label>
                <span className="text-[10px] text-slate-400">Direkomendasikan</span>
              </div>
              <textarea
                rows={3}
                placeholder="Tempel syarat/kualifikasi dari poster loker (misal: Minimal S1, menguasai React/TypeScript, komunikatif)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                AI akan secara spesifik menjodohkan syarat lowongan ini dengan bukti keahlian & pengalaman di CV-mu.
              </p>
            </div>

            {/* 5. Nama Recruiter */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Recruiter (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Rina Hartati"
                value={recruiterName}
                onChange={(e) => handleRecruiterChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Highlight Pengalaman Kunci (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Sebutkan prestasi utama atau portofolio khusus yang ingin ditekankan..."
                value={experienceHighlights}
                onChange={(e) => handleHighlightsChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Menyelaraskan CV ⟷ Lowongan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Susun Surat Lamaran Cerdas (Match CV ⟷ JD)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Result Right */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs flex flex-col space-y-4 h-fit">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Hasil Susunan Surat
                    </h3>
                    {!isManualEdited ? (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        Live Sinkron
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Diedit Manual
                        </span>
                        <button
                          type="button"
                          onClick={handleResetToTemplate}
                          className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Sinkronkan Ulang
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Bisa langsung kamu edit atau salin (otomatis menyesuaikan parameter)
                  </span>
                </div>
              </div>
              {generatedLetter && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pilihan 1: Stop / Manual */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Salin ke clipboard untuk kirim manual via Gmail atau aplikasi lain tanpa bot"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin!' : 'Salin Teks (Manual)'}</span>
                  </button>

                  {/* Pilihan 2: Simpan Draf */}
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Draf</span>
                  </button>

                  {/* Pilihan 3: Lanjut Kirim via Bot */}
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
                      className="px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1738D1]/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Lanjut Kirim via Bot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={`/mailer?cvId=${selectedCvId || ''}`}
                      className="px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1738D1]/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Lanjut Kirim via Bot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3">
              <textarea
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
                className="w-full p-4 rounded-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-[#1738D1] resize-none overflow-hidden"
              />
            </div>

            {generatedLetter && (
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Teks di atas dapat langsung kamu ketik/edit sesuai kebutuhan.</span>
                  <span className="font-mono">{generatedLetter.length} karakter</span>
                </div>

                {selectedCv && (
                  <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <FileCheck2 className="w-4 h-4 text-[#1738D1] dark:text-blue-400 shrink-0" />
                      <span>
                        CV Terhubung: <strong className="font-bold text-slate-900 dark:text-white">{selectedCv.title || 'CV Utama'}</strong>
                        {selectedCv.target_position ? ` (${selectedCv.target_position})` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      Auto-Attach PDF ATS Aktif
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Cover Letters List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Daftar Surat Lamaran Tersimpan ({savedLetters.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Dapat disalin langsung atau dimuat ke editor kapan saja
          </span>
        </div>

        {savedLetters.length === 0 ? (
          <div className="p-8 text-center rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
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
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                      {letter.company}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(letter.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-[10px] border border-slate-100 dark:border-slate-800 font-sans leading-relaxed">
                  {letter.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
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
                      className="px-2 py-1 rounded-[8px] text-[10px] font-bold bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
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
                      className="px-2 py-1 rounded-[8px] text-[10px] font-bold bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
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
                        className="px-2 py-1 rounded-[8px] text-[10px] font-bold bg-[#1738D1] hover:bg-[#132EA8] text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim via Bot</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
