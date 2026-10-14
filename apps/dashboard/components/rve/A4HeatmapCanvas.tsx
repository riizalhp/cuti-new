'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  CvParsedData,
  BoundingBox,
  FixationPoint,
  AtsCorrelationItem,
} from './RveEnginePipeline';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  FileCheck,
  Minimize2,
  Layout,
} from 'lucide-react';
import { CVTemplatePreview, cvTemplates, CVData } from '../CVView';
import { parseCleanBulletLines } from '@/lib/cv-bullets';

export type TemplateArchetype = 'single-column' | 'grid-timeline' | 'sidebar';

export function getTemplateArchetype(templateId?: string): TemplateArchetype {
  if (!templateId) return 'single-column';
  if (templateId === 'harvard-modern') return 'grid-timeline';
  if (
    templateId === 'tech-sidebar' ||
    templateId === 'executive-navy' ||
    templateId.includes('sidebar')
  ) {
    return 'sidebar';
  }
  return 'single-column';
}

export function generateSmoothCurvePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = ((current.x + next.x) / 2).toFixed(1);
    const midY = ((current.y + next.y) / 2).toFixed(1);
    path += ` Q ${current.x.toFixed(1)},${current.y.toFixed(1)} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  path += ` T ${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return path;
}

export function getSummaryDynamicIntensity(text: string): { intensity: number; label: string } {
  const clean = text.trim();
  if (!clean) return { intensity: 0.20, label: 'Ringkasan Kosong' };
  const hasMetrics = /\d+%|\d+\+|persen|\bjt\b|\bjuta\b|\bribu\b|\brp\b|meningkatkan|menghemat|mempercepat/i.test(clean);
  const isWallOfText = clean.length > 320 && !hasMetrics;
  if (isWallOfText) {
    return { intensity: 0.68, label: 'Ringkasan Padat (Wall of Text)' };
  }
  if (hasMetrics || (clean.length >= 80 && clean.length <= 250)) {
    return { intensity: 0.88, label: 'Ringkasan Profil (Hook Terukur)' };
  }
  return { intensity: 0.82, label: 'Ringkasan Profil (Hook)' };
}

export function getBulletDynamicIntensity(text: string, defaultIntensity: number = 0.82): { intensity: number; label: string } {
  const clean = text.trim();
  if (!clean) return { intensity: 0.40, label: 'Poin Belum Terisi' };
  const hasMetrics = /\d+%|\d+\+|persen|\bjt\b|\bjuta\b|\bribu\b|\brp\b|meningkatkan|menghemat|mempercepat/i.test(clean);
  const isWallOfText = clean.length > 160 && !hasMetrics;
  if (hasMetrics) {
    return { intensity: Math.min(0.94, defaultIntensity + 0.10), label: 'Pencapaian Terukur (Metrik %)' };
  }
  if (isWallOfText) {
    return { intensity: Math.max(0.55, defaultIntensity - 0.16), label: 'Tanggung Jawab Padat (Kurang Metrik)' };
  }
  return { intensity: defaultIntensity, label: 'Poin Prestasi Kunci' };
}

interface A4HeatmapCanvasProps {
  parsedData: CvParsedData;
  boundingBoxes: BoundingBox[];
  fixationPoints: FixationPoint[];
  atsCorrelations: AtsCorrelationItem[];
  viewMode: 'heatmap' | 'f-pattern' | 'bbox' | 'ats-matrix';
  showOverlay: boolean;
  targetLevel?: string;
  selectedSavedCv?: any;
  cvSourceMode?: 'saved' | 'upload';
  onCondenseToOnePage?: () => void;
  activePage?: 1 | 2 | 3;
  onPageChange?: (page: 1 | 2 | 3) => void;
}

interface TextDomPosition {
  id: string;
  label: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

export const A4HeatmapCanvas: React.FC<A4HeatmapCanvasProps> = ({
  parsedData,
  boundingBoxes,
  atsCorrelations,
  viewMode,
  showOverlay,
  targetLevel = 'Mid',
  selectedSavedCv,
  cvSourceMode,
  onCondenseToOnePage,
  activePage: propActivePage,
  onPageChange,
}) => {
  const outerWrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active simulated page (1 = The Hook, 2 = The Proof, 3 = The Blindspot)
  const [internalActivePage, setInternalActivePage] = useState<1 | 2 | 3>(1);
  const activePage = propActivePage !== undefined ? propActivePage : internalActivePage;

  const setActivePage = (newPage: 1 | 2 | 3) => {
    setInternalActivePage(newPage);
    onPageChange?.(newPage);
  };

  // Dynamic A4 scaling factor: Base A4 width is 794px @96dpi
  const BASE_A4_WIDTH = 794;
  const BASE_A4_HEIGHT = 1123;
  const [scale, setScale] = useState<number>(1);

  // Store calculated text DOM positions for F-Pattern SVG trajectory & badges
  const [domFixations, setDomFixations] = useState<TextDomPosition[]>([]);

  // Store dynamically calculated section bounding boxes from rendered DOM
  const [domBoundingBoxes, setDomBoundingBoxes] = useState<BoundingBox[]>([]);

  // State for CV bullet point sections
  const [prevParsedData, setPrevParsedData] = useState(parsedData);
  const [cvExperience, setCvExperience] = useState<CvParsedData['experience']>(() =>
    Array.isArray(parsedData?.experience)
      ? parsedData.experience.map((e) => {
          const rawBullets =
            Array.isArray(e?.achievements) && e.achievements.length > 0
              ? e.achievements
              : typeof (e as Record<string, unknown>)?.description === 'string'
              ? ((e as Record<string, unknown>).description as string)
              : [];
          const cleanLines = Array.isArray(rawBullets)
            ? rawBullets.flatMap((b) => parseCleanBulletLines(String(b)))
            : parseCleanBulletLines(String(rawBullets));

          return {
            ...e,
            achievements: cleanLines.length > 0 ? cleanLines : ['Menjalankan tugas dan tanggung jawab sesuai standar operasional.'],
          };
        })
      : []
  );
  const [cvSkills, setCvSkills] = useState<string[]>(() =>
    Array.isArray(parsedData?.skills)
      ? parsedData.skills.map((s) =>
          typeof s === 'string'
            ? s
            : (s as Record<string, unknown>)?.name
            ? String((s as Record<string, unknown>).name)
            : String(s)
        )
      : []
  );
  const [cvEducation, setCvEducation] = useState<CvParsedData['education']>(() => parsedData?.education || []);
  const [cvMiscPoints, setCvMiscPoints] = useState<string[]>([
    'Bahasa Indonesia (Native)',
    'Bahasa Inggris (Komunikasi Kerja / Pasif)',
    'Kemampuan Problem Solving & Manajemen Waktu',
  ]);

  // Adjust state during render when parsedData updates from parent (React pattern)
  if (parsedData !== prevParsedData) {
    setPrevParsedData(parsedData);
    setCvExperience(
      Array.isArray(parsedData?.experience)
        ? parsedData.experience.map((e) => {
            const rawBullets =
              Array.isArray(e?.achievements) && e.achievements.length > 0
                ? e.achievements
                : typeof (e as Record<string, unknown>)?.description === 'string'
                ? ((e as Record<string, unknown>).description as string)
                : [];
            const cleanLines = Array.isArray(rawBullets)
              ? rawBullets.flatMap((b) => parseCleanBulletLines(String(b)))
              : parseCleanBulletLines(String(rawBullets));

            return {
              ...e,
              achievements: cleanLines.length > 0 ? cleanLines : ['Menjalankan tugas dan tanggung jawab sesuai standar operasional.'],
            };
          })
        : []
    );
    setCvSkills(
      Array.isArray(parsedData?.skills)
        ? parsedData.skills.map((s) =>
            typeof s === 'string'
              ? s
              : (s as Record<string, unknown>)?.name
              ? String((s as Record<string, unknown>).name)
              : String(s)
          )
        : []
    );
    setCvEducation(parsedData?.education || []);
  }

  // Handle responsive scale calculation
  useEffect(() => {
    const handleResize = () => {
      if (!outerWrapperRef.current) return;
      const availableWidth = outerWrapperRef.current.clientWidth;
      const targetScale = Math.min(1, Math.max(0.35, availableWidth / BASE_A4_WIDTH));
      setScale(targetScale);
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (outerWrapperRef.current) ro.observe(outerWrapperRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add Achievement Point to Experience
  const handleAddAchievement = (expId: string) => {
    setCvExperience((prev) =>
      (prev || []).map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            achievements: [
              ...(exp.achievements || []),
              'Menyelesaikan tugas operasional dengan teliti dan tepat waktu sesuai standar kerja',
            ],
          };
        }
        return exp;
      })
    );
  };

  // Add Skill Tag
  const handleAddSkill = () => {
    const defaultNewSkills = ['Microsoft Excel', 'Komunikasi Tim', 'Canva', 'Administrasi Dokumen', 'Penyelesaian Masalah'];
    const current = cvSkills || [];
    const unusedSkill = defaultNewSkills.find((s) => !current.includes(s)) || `Skill Baru #${current.length + 1}`;
    setCvSkills((prev) => [...(prev || []), unusedSkill]);
  };

  // Add Education Bullet Line
  const handleAddEducation = () => {
    setCvEducation((prev) => [
      ...(prev || []),
      {
        id: `edu-new-${Date.now()}`,
        institution: 'SMK / Universitas / Pelatihan Vokasi',
        degree: 'Pendidikan Terkait / Sertifikasi Kualifikasi',
        period: '2021 - 2024',
        gpa: 'Lulus dengan Baik',
      },
    ]);
  };

  // Add Misc Info Line
  const handleAddMiscPoint = () => {
    setCvMiscPoints((prev) => [
      ...(prev || []),
      `Sertifikasi Keahlian / Informasi Tambahan Baru #${(prev || []).length + 1}`,
    ]);
  };

  // Data derivation for candidate profile and template
  const candidateName: string = String(
    parsedData?.candidateName ||
    selectedSavedCv?.candidateName ||
    selectedSavedCv?.fullName ||
    'Nama Pelamar'
  );
  const roleTitle: string = String(
    parsedData?.roleTitle ||
    selectedSavedCv?.roleTitle ||
    selectedSavedCv?.headline ||
    'Posisi Target'
  );
  const email: string = String(parsedData?.email || selectedSavedCv?.email || 'email@example.com');
  const phone: string = String(parsedData?.phone || selectedSavedCv?.phone || '0812-xxxx-xxxx');
  const location: string = String(
    parsedData?.location || selectedSavedCv?.location || selectedSavedCv?.city || 'Indonesia'
  );
  const summary: string = String(
    parsedData?.summary ||
    selectedSavedCv?.summary ||
    'Kandidat berdedikasi dengan kesiapan kerja nyata dan kemampuan adaptasi tinggi.'
  );

  // Data distribution for Page 1 and Page 2 fallback
  const primaryExperience = (cvExperience || []).slice(0, 2);
  const secondaryExperience = (cvExperience || []).slice(2);
  const primarySkills = (cvSkills || []).slice(0, 8);
  const secondarySkills = (cvSkills || []).slice(8);

  // Template ID and Archetype detection
  const effectiveTemplateId = useMemo(() => {
    return selectedSavedCv?.templateId || selectedSavedCv?.data?.templateId || 'ats-modern';
  }, [selectedSavedCv]);

  const isUsingCustomTemplate = Boolean(
    cvSourceMode !== 'upload' && Boolean(effectiveTemplateId)
  );

  const activeArchetype = useMemo(() => {
    return getTemplateArchetype(effectiveTemplateId);
  }, [effectiveTemplateId]);

  const activeTemplateOption = useMemo(() => {
    return cvTemplates.find((t) => t.id === effectiveTemplateId);
  }, [effectiveTemplateId]);

  // Document formatting and dynamic page margins (sync 1:1 with CVView)
  const docMarginTop = typeof selectedSavedCv?.docMarginTop === 'number' ? selectedSavedCv.docMarginTop : 1.27;
  const docMarginBottom = typeof selectedSavedCv?.docMarginBottom === 'number' ? selectedSavedCv.docMarginBottom : 1.27;
  const docMarginLeft = typeof selectedSavedCv?.docMarginLeft === 'number' ? selectedSavedCv.docMarginLeft : 1.27;
  const docMarginRight = typeof selectedSavedCv?.docMarginRight === 'number' ? selectedSavedCv.docMarginRight : 1.27;
  const docFontFamily = (selectedSavedCv?.docFontFamily as string) || 'sans';
  const docFontSize = (selectedSavedCv?.docFontSize as string) || 'base';
  const docSpacing = (selectedSavedCv?.docSpacing as string) || 'normal';
  const docShowIcons = selectedSavedCv?.docShowIcons !== undefined ? Boolean(selectedSavedCv.docShowIcons) : true;

  const marginTopMM = docMarginTop * 10;
  const marginBottomMM = docMarginBottom * 10;
  const verticalMarginsMM = marginTopMM + marginBottomMM;
  const PRINTABLE_HEIGHT_MM = Math.max(100, 297 - verticalMarginsMM);
  const PRINTABLE_HEIGHT_PX = PRINTABLE_HEIGHT_MM * 3.779527559;

  const templateContentRef = useRef<HTMLDivElement | null>(null);
  const [pageBreakPx, setPageBreakPx] = useState<number>(() => PRINTABLE_HEIGHT_PX);

  const archetypeInfo = useMemo(() => {
    if (activePage === 2) {
      return {
        label: 'Lembar Verifikasi Kredensial (The Proof)',
        patternName: 'Deep Proof Verification Scan',
        badge: 'Verifikasi Halaman 2',
        insight:
          'Prediksi Tatapan HRD (Detik 6–10): Menyisir paruh atas lembar kedua untuk validasi Riwayat Pendidikan, institusi, IPK, dan detail keahlian teknis.',
      };
    }
    switch (activeArchetype) {
      case 'grid-timeline':
        return {
          label: 'Grid 2-Kolom Timeline (Harvard Format)',
          patternName: 'Anchored Saccade Scan',
          badge: 'Harvard Grid 2-Kolom',
          insight:
            'Prediksi Tatapan HRD: Pandangan membidik Jabatan di kolom kanan (detik 1–2), lalu melirik ke kolom kiri 140px untuk verifikasi durasi/gap karier (detik 2–3). Bukan zig-zag ping-pong!',
        };
      case 'sidebar':
        return {
          label: 'Asymmetric Sidebar Layout',
          patternName: 'Bifurcated Dual-Zone Scan',
          badge: 'Sidebar Asimetris',
          insight:
            'Prediksi Tatapan HRD: Pemisahan fokus cepat (detik 0-1 pemindaian identitas & skill di sidebar kiri, kemudian tatapan beralih ke riwayat pengalaman kerja di kolom utama kanan).',
        };
      case 'single-column':
      default:
        return {
          label: '1-Kolom Standar ATS Internasional',
          patternName: 'Classic F-Shape Reading Pattern',
          badge: '1 Kolom ATS',
          insight:
            'Prediksi Tatapan HRD: Pola F murni (pandangan bergerak horizontal di paruh atas pada nama dan ringkasan, lalu menyapu vertikal ke bawah di sepanjang sisi kiri heading pengalaman kerja).',
        };
    }
  }, [activeArchetype, activePage]);

  // Transform data into CVData shape for CVTemplatePreview
  const previewCustomData = useMemo(() => {
    const baseExp =
      cvExperience && cvExperience.length > 0
        ? cvExperience
        : selectedSavedCv?.experience || [];

    const rawExp = baseExp.map((exp: any) => {
      const rawBullets =
        Array.isArray(exp.achievements) && exp.achievements.length > 0
          ? exp.achievements
          : Array.isArray(exp.bullets) && (exp.bullets as unknown[]).length > 0
          ? (exp.bullets as unknown[])
          : typeof exp.description === 'string'
          ? exp.description
          : [];
      const cleanLines = Array.isArray(rawBullets)
        ? rawBullets.flatMap((b: any) => parseCleanBulletLines(String(b)))
        : parseCleanBulletLines(String(rawBullets));

      return {
        role: (exp.role as string) || (exp.title as string) || '',
        company: (exp.company as string) || '',
        period:
          (exp.period as string) ||
          (exp.startDate
            ? `${String(exp.startDate)} - ${String(exp.endDate || 'Sekarang')}`
            : ''),
        description: cleanLines.join('\n'),
        location: (exp.location as string) || '',
        startDate: (exp.startDate as string) || '',
        endDate: (exp.endDate as string) || '',
      };
    });

    const rawEdu =
      cvEducation && cvEducation.length > 0
        ? cvEducation.map((edu: any) => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            period: edu.period || '',
            gpa: edu.gpa || '',
            fieldOfStudy: (edu?.fieldOfStudy as string) || '',
            startDate: (edu?.startDate as string) || '',
            endDate: (edu?.endDate as string) || '',
          }))
        : (selectedSavedCv?.education as any[]) || [];

    const rawSkillsList =
      cvSkills && cvSkills.length > 0 ? cvSkills : selectedSavedCv?.skills || [];

    return {
      fullName: candidateName,
      headline: roleTitle,
      email,
      phone,
      location,
      summary,
      experience: rawExp,
      skills: rawSkillsList,
      education: rawEdu,
      projects: selectedSavedCv?.projects || [],
      certifications: selectedSavedCv?.certifications || [],
      internships: selectedSavedCv?.internships || [],
      organizations: selectedSavedCv?.organizations || [],
      photoUrl: selectedSavedCv?.photoUrl || '',
      sectionOrder: selectedSavedCv?.sectionOrder,
    };
  }, [
    candidateName,
    roleTitle,
    email,
    phone,
    location,
    summary,
    cvExperience,
    cvSkills,
    cvEducation,
    selectedSavedCv,
  ]);

  // Measure clean page break for Page 2 slicing (prevent breaking blocks horizontally)
  useEffect(() => {
    if (!isUsingCustomTemplate || !templateContentRef.current) return;
    const parent = templateContentRef.current;
    const candidateNodes = Array.from(
      parent.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, li, p, .grid > div, .space-y-4 > div, .space-y-3 > div'
      )
    );
    if (candidateNodes.length === 0) return;

    const parentRect = parent.getBoundingClientRect();
    const blockRects = candidateNodes
      .map((node) => {
        const r = node.getBoundingClientRect();
        const top = (r.top - parentRect.top) / scale;
        const bottom = (r.bottom - parentRect.top) / scale;
        return { top, bottom, height: bottom - top };
      })
      .filter((b) => b.height > 0)
      .sort((a, b) => a.top - b.top);

    const maxTarget = PRINTABLE_HEIGHT_PX;
    const crossingBlock = blockRects.find(
      (b) => b.top < maxTarget && b.bottom > maxTarget && b.top > 15
    );

    let breakPx = maxTarget;
    if (crossingBlock && crossingBlock.top > 15) {
      breakPx = crossingBlock.top;
    } else {
      const fitting = blockRects.filter((b) => b.bottom <= maxTarget && b.top >= 0);
      if (fitting.length > 0) {
        const lastFit = fitting[fitting.length - 1];
        const nextOne = blockRects.find((b) => b.top >= lastFit.bottom && b.top > 15);
        if (nextOne && nextOne.top <= maxTarget + 20) {
          breakPx = nextOne.top;
        }
      }
    }

    setPageBreakPx((prev) => (Math.abs(prev - breakPx) < 1 ? prev : breakPx));
  }, [
    isUsingCustomTemplate,
    previewCustomData,
    effectiveTemplateId,
    PRINTABLE_HEIGHT_PX,
    scale,
  ]);

  // Canvas Heatmap Drawing Engine: Aligned in virtual 794x1123 coordinate grid
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || activePage === 3) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderHeatmap = () => {
      canvas.width = BASE_A4_WIDTH;
      canvas.height = BASE_A4_HEIGHT;
      ctx.clearRect(0, 0, BASE_A4_WIDTH, BASE_A4_HEIGHT);

      const containerRect = container.getBoundingClientRect();
      const explicitHeatmapElements = container.querySelectorAll<HTMLElement>('[data-heatmap]');
      let positions: TextDomPosition[] = [];

      if (explicitHeatmapElements.length > 0) {
        // Fallback or explicit layout scanning
        let orderCount = 1;
        explicitHeatmapElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const relX = (rect.left - containerRect.left) / scale;
          const relY = (rect.top - containerRect.top) / scale;
          const relW = rect.width / scale;
          const relH = rect.height / scale;

          const intensityAttr = el.getAttribute('data-heatmap-intensity');
          const defaultIntensity = activePage === 1 ? '0.75' : '0.55';
          const intensity = parseFloat(intensityAttr || defaultIntensity);
          const label = el.getAttribute('data-heatmap-label') || el.innerText.substring(0, 24);

          if (relW > 0 && relH > 0) {
            positions.push({
              id: `dom-fp-${orderCount}`,
              label,
              order: orderCount++,
              x: relX,
              y: relY,
              width: relW,
              height: relH,
              intensity,
            });
          }
        });
      } else {
        // Semantic Archetype DOM extraction for CVTemplatePreview
        const toPos = (
          el: HTMLElement | null | undefined,
          id: string,
          label: string,
          order: number,
          intensity: number
        ): TextDomPosition | null => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const relX = (rect.left - containerRect.left) / scale;
          const relY = (rect.top - containerRect.top) / scale;
          const relW = rect.width / scale;
          const relH = rect.height / scale;
          if (relW <= 4 || relH <= 4) return null;
          if (relY + relH < 20 || relY > BASE_A4_HEIGHT - 20) return null;
          return {
            id,
            label,
            order,
            x: Math.max(0, relX),
            y: Math.max(0, relY),
            width: Math.min(relW, BASE_A4_WIDTH - Math.max(0, relX)),
            height: relH,
            intensity,
          };
        };

        // Dynamically extract real section bounding boxes from rendered DOM
        const discoveredBoxes: BoundingBox[] = [];
        if (isUsingCustomTemplate) {
          const sectionDefs = [
            { type: 'header' as const, selectors: ['[data-cv-section="header"]', 'header'], title: 'Header & Identitas Utama', weight: 0.95 },
            { type: 'summary' as const, selectors: ['[data-cv-section="summary"]'], title: 'Ringkasan Profil (Executive Summary)', weight: 0.85, kw: 'ringkasan' },
            { type: 'experience' as const, selectors: ['[data-cv-section="experience"]'], title: 'Pengalaman Kerja & Pencapaian', weight: 0.92, kw: 'pengalaman' },
            { type: 'skills' as const, selectors: ['[data-cv-section="skills"]'], title: 'Keterampilan & Tech Stack', weight: 0.80, kw: 'keahlian' },
            { type: 'education' as const, selectors: ['[data-cv-section="education"]'], title: 'Pendidikan & Kualifikasi', weight: 0.72, kw: 'pendidikan' },
            { type: 'experience' as const, selectors: ['[data-cv-section="internships"]'], title: 'Pengalaman Magang', weight: 0.78, kw: 'magang' },
            { type: 'experience' as const, selectors: ['[data-cv-section="projects"]'], title: 'Proyek Unggulan', weight: 0.84, kw: 'proyek' },
          ];

          sectionDefs.forEach((sd) => {
            let el: HTMLElement | null = null;
            for (const sel of sd.selectors) {
              el = container.querySelector<HTMLElement>(sel);
              if (el) break;
            }
            if (!el && sd.kw) {
              const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3'));
              const matchedH = headings.find((h) => h.innerText.toLowerCase().includes(sd.kw!));
              if (matchedH) {
                el = (matchedH.closest('.mb-6, .mb-5, .mb-4, section') as HTMLElement) || matchedH.parentElement;
              }
            }
            if (el) {
              const rect = el.getBoundingClientRect();
              const relX = (rect.left - containerRect.left) / scale;
              const relY = (rect.top - containerRect.top) / scale;
              const relW = rect.width / scale;
              const relH = rect.height / scale;
              if (relW > 20 && relH > 15 && relY + relH > 20 && relY < BASE_A4_HEIGHT - 20) {
                discoveredBoxes.push({
                  id: `dyn-box-${sd.type}`,
                  type: sd.type,
                  x: Math.max(0, relX),
                  y: Math.max(0, relY),
                  width: Math.min(relW, BASE_A4_WIDTH - Math.max(0, relX)),
                  height: relH,
                  visualWeight: sd.weight,
                  title: sd.title,
                });
              }
            }
          });
        }
        setDomBoundingBoxes(discoveredBoxes);

        if (activePage === 1) {
          const nameEl = container.querySelector<HTMLElement>(
            '[data-cv-node="name"], h1, header h1, header h2, .font-black.text-3xl, .font-black.text-2xl'
          );
          const roleEl = container.querySelector<HTMLElement>(
            '[data-cv-node="role"], header p, header .font-bold, header .text-sm, h1 + p, h1 + div'
          );
          const summaryP = container.querySelector<HTMLElement>(
            '[data-cv-node="summary-text"], [data-cv-section="summary"] p, p.leading-relaxed, p.text-xs.leading-relaxed'
          );

          if (activeArchetype === 'grid-timeline') {
            // Harvard Modern: Grid 2-Kolom (140px date kiri, 1fr content kanan)
            const gridItems = Array.from(
              container.querySelectorAll<HTMLElement>(
                '.grid.grid-cols-\\[140px_1fr\\], .grid.grid-cols-2'
              )
            ).filter((g) => {
              const r = g.getBoundingClientRect();
              const ry = (r.top - containerRect.top) / scale;
              return ry >= 20 && ry <= BASE_A4_HEIGHT - 20;
            });

            const firstGrid = gridItems[0];
            const dateCol = firstGrid?.children[0] as HTMLElement | undefined;
            const contentCol = firstGrid?.children[1] as HTMLElement | undefined;
            const roleInContent =
              contentCol?.querySelector<HTMLElement>('[data-cv-node="job-title"], p.font-bold, .font-bold, h3') || contentCol;
            const bulletInContent =
              contentCol?.querySelector<HTMLElement>('li, .text-xs.leading-relaxed') || null;

            const secondGrid = gridItems[1] || null;
            const eduContent = secondGrid?.children[1] as HTMLElement | undefined;

            const bulletEval = getBulletDynamicIntensity(bulletInContent?.innerText || '', 0.82);
            const p1 = toPos(nameEl, 'fp-1', 'Nama Pelamar', 1, 0.96);
            const p2 = toPos(roleInContent, 'fp-2', 'Role Posisi Utama (Kanan)', 2, 0.92);
            const p3 = toPos(dateCol, 'fp-3', 'Anchor Durasi & Gap (Kiri)', 3, 0.86);
            const p4 = toPos(bulletInContent, 'fp-4', bulletEval.label, 4, bulletEval.intensity);
            const p5 = toPos(eduContent, 'fp-5', 'Pendidikan & Kualifikasi', 5, 0.72);

            [p1, p2, p3, p4, p5].forEach((p) => {
              if (p) positions.push(p);
            });
          } else if (activeArchetype === 'sidebar') {
            const sidebarEl = container.querySelector<HTMLElement>(
              'aside, .w-64, [class*="bg-cyan"], [class*="bg-slate-900"]'
            );
            const mainEl = container.querySelector<HTMLElement>('main, .flex-1');

            const sidebarSkill = sidebarEl?.querySelector<HTMLElement>('[data-cv-node="skills-text"], span, li, p') || null;
            const mainRole = mainEl?.querySelector<HTMLElement>('[data-cv-node="job-title"], p.font-bold, h3, .font-bold') || null;
            const mainBullet = mainEl?.querySelector<HTMLElement>('li, p.text-xs') || null;
            const mainEdu = mainEl?.querySelectorAll<HTMLElement>('.font-bold')[1] || null;

            const bulletEval = getBulletDynamicIntensity(mainBullet?.innerText || '', 0.82);
            const p1 = toPos(nameEl, 'fp-1', 'Identitas Pelamar', 1, 0.96);
            const p2 = toPos(sidebarSkill, 'fp-2', 'Skill Filter di Sidebar', 2, 0.85);
            const p3 = toPos(mainRole, 'fp-3', 'Pengalaman Kerja Utama', 3, 0.92);
            const p4 = toPos(mainBullet, 'fp-4', bulletEval.label, 4, bulletEval.intensity);
            const p5 = toPos(mainEdu, 'fp-5', 'Pendidikan Formal', 5, 0.7);

            [p1, p2, p3, p4, p5].forEach((p) => {
              if (p) positions.push(p);
            });
          } else {
            // ATS Modern & Single Column Layouts
            const firstRole =
              container.querySelector<HTMLElement>(
                '[data-cv-item="exp-0"] [data-cv-node="job-title"], [data-cv-section="experience"] [data-cv-node="job-title"], [data-cv-section="experience"] p.font-bold, h3, p.font-bold, .text-sm.font-bold'
              ) || null;
            const firstBullet =
              container.querySelector<HTMLElement>(
                '[data-cv-item="exp-0"] li, [data-cv-section="experience"] li, [data-cv-node="job-bullets"] li, li, ul li'
              ) || null;
            const skillsContainer =
              container.querySelector<HTMLElement>(
                '[data-cv-section="skills"] [data-cv-node="skills-text"], [data-cv-section="skills"] p, [data-cv-section="skills"], [class*="skill"], .flex.flex-wrap'
              ) || null;
            const firstEdu =
              container.querySelector<HTMLElement>(
                '[data-cv-item="edu-0"] [data-cv-node="edu-institution"], [data-cv-section="education"] p.font-bold'
              ) || null;

            const sumEval = getSummaryDynamicIntensity(summaryP?.innerText || '');
            const bulletEval = getBulletDynamicIntensity(firstBullet?.innerText || '', 0.80);
            const p1 = toPos(nameEl, 'fp-1', 'Nama Pelamar', 1, 0.96);
            const p2 = toPos(roleEl, 'fp-2', 'Posisi Target', 2, 0.88);
            const p3 = toPos(summaryP, 'fp-3', sumEval.label, 3, sumEval.intensity);
            const p4 = toPos(firstRole, 'fp-4', 'Pengalaman Kerja Utama', 4, 0.92);
            const p5 = toPos(firstBullet, 'fp-5', bulletEval.label, 5, bulletEval.intensity);
            const p6 = toPos(skillsContainer, 'fp-6', 'Keahlian & Kompetensi', 6, 0.74);
            const p7 = toPos(firstEdu, 'fp-7', 'Pendidikan & Kualifikasi', 7, 0.68);

            [p1, p2, p3, p4, p5, p6, p7].forEach((p) => {
              if (p) positions.push(p);
            });
          }
        } else if (activePage === 2) {
          // PAGE 2: VERIFIKASI KREDENSIAL (THE PROOF)
          const visibleH2s = Array.from(container.querySelectorAll<HTMLElement>('[data-cv-node="heading"], h2'))
            .map((h2) => ({ el: h2, pos: toPos(h2, '', '', 0, 0.88) }))
            .filter((item): item is { el: HTMLElement; pos: TextDomPosition } => item.pos !== null)
            .sort((a, b) => a.pos.y - b.pos.y);

          const visibleGrids = Array.from(
            container.querySelectorAll<HTMLElement>(
              '[data-cv-item], .grid.grid-cols-\\[140px_1fr\\], .grid.grid-cols-2, .space-y-3 > div, .space-y-4 > div'
            )
          )
            .map((g) => ({ el: g, pos: toPos(g, '', '', 0, 0.82) }))
            .filter((item): item is { el: HTMLElement; pos: TextDomPosition } => item.pos !== null)
            .sort((a, b) => a.pos.y - b.pos.y);

          const visibleBullets = Array.from(
            container.querySelectorAll<HTMLElement>('li, .flex.flex-wrap span')
          )
            .map((b) => ({ el: b, pos: toPos(b, '', '', 0, 0.76) }))
            .filter((item): item is { el: HTMLElement; pos: TextDomPosition } => item.pos !== null)
            .sort((a, b) => a.pos.y - b.pos.y);

          let pOrder = 1;

          if (visibleH2s.length > 0) {
            const firstH2 = visibleH2s[0];
            const h2Title = firstH2.el.innerText.trim();
            positions.push({
              ...firstH2.pos,
              id: `fp-p2-sec-${pOrder}`,
              label: `Verifikasi: ${h2Title.substring(0, 22)}`,
              order: pOrder++,
              intensity: 0.88,
            });
          }

          if (visibleGrids.length > 0) {
            const firstGrid = visibleGrids[0];
            const roleOrInst =
              firstGrid.el.querySelector<HTMLElement>('[data-cv-node="job-title"], [data-cv-node="edu-institution"], p.font-bold, .font-bold, h3') || firstGrid.el;
            const rolePos = toPos(
              roleOrInst,
              `fp-p2-item-${pOrder}`,
              'Kualifikasi / Institusi',
              pOrder,
              0.85
            );
            if (rolePos) {
              positions.push(rolePos);
              pOrder++;
            }

            const dateOrYear = firstGrid.el.querySelector<HTMLElement>(
              '[data-cv-node="job-period"], [data-cv-node="edu-year"], .font-bold.uppercase, .text-slate-600, .text-slate-500'
            );
            if (dateOrYear && dateOrYear !== roleOrInst) {
              const datePos = toPos(
                dateOrYear,
                `fp-p2-date-${pOrder}`,
                'Verifikasi Tahun / Periode',
                pOrder,
                0.78
              );
              if (datePos) {
                positions.push(datePos);
                pOrder++;
              }
            }
          }

          if (visibleBullets.length > 0) {
            const firstBullet = visibleBullets[0];
            positions.push({
              ...firstBullet.pos,
              id: `fp-p2-detail-${pOrder}`,
              label: 'Bukti Pencapaian / Kualifikasi',
              order: pOrder++,
              intensity: 0.76,
            });
          }

          if (visibleH2s.length > 1) {
            const secondH2 = visibleH2s[1];
            const h2Title = secondH2.el.innerText.trim();
            positions.push({
              ...secondH2.pos,
              id: `fp-p2-sec2-${pOrder}`,
              label: `Verifikasi: ${h2Title.substring(0, 22)}`,
              order: pOrder++,
              intensity: 0.82,
            });
          } else if (visibleGrids.length > 1) {
            const secondGrid = visibleGrids[1];
            const secondRole =
              secondGrid.el.querySelector<HTMLElement>('[data-cv-node="job-title"], [data-cv-node="edu-institution"], p.font-bold, .font-bold') || secondGrid.el;
            const sPos = toPos(
              secondRole,
              `fp-p2-item2-${pOrder}`,
              'Kredensial Pendukung',
              pOrder,
              0.74
            );
            if (sPos) {
              positions.push(sPos);
              pOrder++;
            }
          }
        }

        // Normalisasi nomor urutan
        positions = positions.map((p, idx) => ({ ...p, order: idx + 1 }));
      }

      // Draw heat blobs onto 2D canvas with realistic F-pattern human eye scan dynamics
      if (showOverlay && viewMode === 'heatmap') {
        const drawHeatBlob = (px: number, py: number, radius: number, intensity: number) => {
          if (intensity < 0.40) return;
          const radGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);

          if (intensity >= 0.84) {
            // FOKUS UTAMA: Merah Panas ke Oranye
            radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.78)');
            radGrad.addColorStop(0.42, 'rgba(249, 115, 22, 0.48)');
            radGrad.addColorStop(0.75, 'rgba(234, 179, 8, 0.18)');
            radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
          } else if (intensity >= 0.68) {
            // PINDAIAN CEPAT: Oranye Hangat ke Kuning Amber
            radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
            radGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.30)');
            radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
          } else if (intensity >= 0.45) {
            // ATENSI TEPI: Kuning Amber Lembut
            radGrad.addColorStop(0, 'rgba(234, 179, 8, 0.38)');
            radGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.10)');
            radGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
          }

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        positions.forEach((pos) => {
          const isMultiLine = pos.height > 28;

          if (!isMultiLine) {
            // Single-line element (Name, Role, Job Title, Section Header)
            const scanY = pos.y + Math.min(14, pos.height * 0.45);
            const focalWidth = Math.min(pos.width, 240);
            const dotSpacing = Math.max(14, Math.min(focalWidth / 4, 28));
            const baseRadius = Math.max(18, Math.min(pos.height * 1.1, 26));

            for (let px = pos.x + 12; px <= pos.x + focalWidth; px += dotSpacing) {
              const progress = (px - (pos.x + 12)) / Math.max(1, focalWidth - 12);
              const effIntensity = pos.intensity * (1 - progress * 0.25);
              drawHeatBlob(px, scanY, baseRadius, effIntensity);
            }
          } else {
            // Multi-line block (Summary paragraph, Bullet point list)
            // F-pattern scanning: Primary scan along top line, secondary shorter scan on line 2
            const baseRadius = 22;
            const line1Y = pos.y + 12;
            const line1Width = Math.min(pos.width, 260);
            const dotSpacing = 24;

            for (let px = pos.x + 12; px <= pos.x + line1Width; px += dotSpacing) {
              const progress = (px - (pos.x + 12)) / Math.max(1, line1Width - 12);
              const effIntensity = pos.intensity * (1 - progress * 0.45);
              drawHeatBlob(px, line1Y, baseRadius, effIntensity);
            }

            if (pos.height > 40) {
              const line2Y = pos.y + 28;
              const line2Width = Math.min(pos.width * 0.55, 140);
              for (let px = pos.x + 12; px <= pos.x + line2Width; px += dotSpacing) {
                const progress = (px - (pos.x + 12)) / Math.max(1, line2Width - 12);
                const effIntensity = pos.intensity * 0.65 * (1 - progress * 0.40);
                drawHeatBlob(px, line2Y, baseRadius * 0.9, effIntensity);
              }
            }
          }
        });
      }

      setDomFixations(positions);
    };

    const timer1 = setTimeout(renderHeatmap, 60);
    const timer2 = setTimeout(renderHeatmap, 220);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [
    parsedData,
    viewMode,
    showOverlay,
    activePage,
    scale,
    cvExperience,
    cvSkills,
    cvEducation,
    isUsingCustomTemplate,
    effectiveTemplateId,
    activeArchetype,
    pageBreakPx,
  ]);

  return (
    <div
      ref={outerWrapperRef}
      className="w-full rounded-[10px] bg-slate-100/75 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-5 lg:p-6 flex flex-col items-center gap-3.5 transition-colors shadow-2xs"
    >
      {/* 1. DOCUMENT STAGE TOOLBAR (Docked to full width of the workbench stage) */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:px-3 sm:py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tab Page 1 */}
          <button
            type="button"
            onClick={() => setActivePage(1)}
            className={`px-3 py-1.5 min-h-[32px] rounded-[8px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePage === 1
                ? 'bg-cobalt-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Halaman 1 (The Hook)</span>
            <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-extrabold bg-emerald-700 text-white">
              95% Peluang Scan
            </span>
          </button>

          {/* Tab Page 2 */}
          <button
            type="button"
            onClick={() => setActivePage(2)}
            className={`px-3 py-1.5 min-h-[32px] rounded-[8px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePage === 2
                ? 'bg-cobalt-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Halaman 2 (The Proof)</span>
            <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-extrabold bg-blue-700 text-white">
              Verifikasi
            </span>
          </button>

          {/* Tab Page 3 */}
          <button
            type="button"
            onClick={() => setActivePage(3)}
            className={`px-3 py-1.5 min-h-[32px] rounded-[8px] text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activePage === 3
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Halaman 3+ (Zona Bahaya)</span>
            <span className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-extrabold bg-rose-700 text-white">
              Drop-off 95%
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 text-caption text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Skala Cetak Baku A4 (210 × 297 mm)</span>
          </div>
          {activePage === 3 && onCondenseToOnePage && (
            <button
              type="button"
              onClick={onCondenseToOnePage}
              className="px-2.5 py-1 rounded-[6px] bg-rose-600 hover:bg-rose-700 text-white text-caption font-bold shrink-0 transition flex items-center gap-1 cursor-pointer shadow-xs ml-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Padatkan ke 1 Halaman</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CONTEXTUAL BEHAVIOR BANNER BASED ON ACTIVE PAGE (Full stage width) */}
      <div className="w-full">
        {activePage === 1 && (
          <div className="p-3 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-xs text-navy-700 dark:text-blue-300 flex items-start gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-cobalt-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-extrabold">Tahap 6 Detik Pertama (The Hook):</strong> Rekruter menghabiskan 80% keputusan awal lolos/tidaknya berkas di lembar ini. Pastikan identitas, ringkasan profil, dan keahlian utama kamu terlihat jelas di paruh atas halaman.
            </div>
          </div>
        )}

        {activePage === 2 && (
          <div className="p-3 rounded-[10px] bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-extrabold">Lembar Verifikasi Kredibilitas (The Proof):</strong> Halaman ini dibaca setelah rekruter tertarik di Halaman 1 untuk memvalidasi bukti riwayat pendidikan, sertifikasi, dan tautan portofolio. Hindari memasukkan *filler* (hobi generik / webinar sepele) agar ekspektasi tinggi dari Halaman 1 tidak runtuh.
            </div>
          </div>
        )}

        {activePage === 3 && (
          <div className="p-3 rounded-[10px] bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold">Peringatan Kritis Eliminasi (Dead Zone):</strong> 95% rekruter tidak pernah menggulir ke halaman ke-3 untuk pelamar pemula (usia 16–24 tahun). Berkas 3 halaman sering dinilai tidak mampu memilah prioritas kerja.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. PROPORTIONAL VIRTUAL A4 CANVAS CONTAINER */}
      <div
        style={{
          width: `${BASE_A4_WIDTH * scale}px`,
          height: `${BASE_A4_HEIGHT * scale}px`,
        }}
        className="relative overflow-hidden rounded-[8px] border border-slate-300 dark:border-slate-700 shadow-xl bg-slate-100 transition-all select-none my-1"
      >
        {/* INNER A4 SHEET: Fixed 794x1123 Virtual Space Scaled via CSS Transform */}
        <div
          ref={containerRef}
          style={{
            width: `${BASE_A4_WIDTH}px`,
            height: `${BASE_A4_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            fontFamily: 'Inter, var(--font-inter), sans-serif',
          }}
          className={`relative bg-white text-slate-900 ${
            (isUsingCustomTemplate && (activePage === 1 || activePage === 2)) || activePage === 3 ? 'p-0' : 'p-10'
          } flex flex-col justify-between overflow-hidden`}
        >
          {/* HTML5 Canvas Heatmap Overlay Layer */}
          {activePage !== 3 && (
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 ${
                showOverlay && viewMode === 'heatmap' ? 'opacity-90 blur-[1px]' : 'opacity-0'
              }`}
            />
          )}

          {/* Saccadic Reading Path Lines SVG Layer (Pages 1 & 2) */}
          {activePage !== 3 && showOverlay && viewMode === 'f-pattern' && domFixations.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
              <defs>
                <linearGradient id="f-path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#F97316" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0.70" />
                </linearGradient>
                <marker
                  id="saccade-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="4"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#F97316" />
                </marker>
              </defs>
              <path
                d={generateSmoothCurvePath(
                  domFixations.map((fp) => ({
                    x: fp.x + Math.min(24, Math.max(12, fp.width * 0.15)),
                    y: fp.y + Math.min(14, Math.max(8, fp.height * 0.35)),
                  }))
                )}
                fill="none"
                stroke="url(#f-path-grad)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#saccade-arrow)"
                className="animate-pulse motion-reduce:animate-none"
              />
            </svg>
          )}

          {/* ========================================================= */}
          {/* REAL TEMPLATE RENDERER (PAGES 1 & 2)                      */}
          {/* ========================================================= */}
          {activePage !== 3 && isUsingCustomTemplate && (
            <div className="w-full h-full flex flex-col justify-between box-border">
              {/* Page Top Margin Spacer */}
              <div style={{ height: `${docMarginTop}cm`, width: '100%', flexShrink: 0 }} />

              {/* Printable Content Slice Viewport */}
              <div
                className="w-full overflow-hidden flex-1 relative flex flex-col justify-start"
                style={{
                  height: `${PRINTABLE_HEIGHT_MM}mm`,
                  maxHeight: `${PRINTABLE_HEIGHT_MM}mm`,
                }}
              >
                <div
                  className="w-full overflow-hidden relative"
                  style={{
                    height: '100%',
                    maxHeight: `${PRINTABLE_HEIGHT_MM}mm`,
                  }}
                >
                  <div
                    ref={templateContentRef}
                    className="w-full transition-transform duration-150 ease-out"
                    style={{
                      transform: activePage === 2 ? `translateY(-${pageBreakPx}px)` : 'translateY(0px)',
                    }}
                  >
                    <CVTemplatePreview
                      templateId={effectiveTemplateId}
                      customData={previewCustomData}
                      docFontFamily={docFontFamily}
                      docFontSize={docFontSize}
                      docSpacing={docSpacing}
                      docShowIcons={docShowIcons}
                      docMarginTop={docMarginTop}
                      docMarginBottom={docMarginBottom}
                      docMarginLeft={docMarginLeft}
                      docMarginRight={docMarginRight}
                    />
                  </div>
                </div>
              </div>

              {/* Page Bottom Margin Spacer & Page Number Indicator */}
              <div
                style={{ height: `${docMarginBottom}cm`, width: '100%', flexShrink: 0 }}
                className="flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-medium select-none"
              >
                <span>Halaman {activePage} dari 2</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FALLBACK MODE: PAGE 1 CONTENT (THE HOOK)                  */}
          {/* ========================================================= */}
          {activePage === 1 && !isUsingCustomTemplate && (
            <>
                {/* Header */}
                <div className="relative z-10 border-b border-slate-200 pb-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1
                        data-heatmap="header-name"
                        data-heatmap-intensity="0.96"
                        data-heatmap-label="Nama Pelamar"
                        className="text-2xl font-black tracking-tight text-slate-900 inline-block"
                      >
                        {candidateName}
                      </h1>
                      <div className="block mt-0.5">
                        <span
                          data-heatmap="header-role"
                          data-heatmap-intensity="0.88"
                          data-heatmap-label="Posisi / Bidang Keahlian"
                          className="text-sm font-bold text-navy-700 inline-block"
                        >
                          {roleTitle} • <span className="text-navy-500 font-semibold">{targetLevel} Level</span>
                        </span>
                      </div>
                    </div>
                    {showOverlay && (
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-black bg-rose-600 text-white shadow-xs z-30">
                        Hotspot #1 (96%)
                      </span>
                    )}
                  </div>

                  <p className="text-caption text-slate-500 flex flex-wrap gap-4 pt-1 font-medium">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {phone}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {location}</span>
                  </p>
                </div>

                {/* Ringkasan Profil (Executive Summary) */}
                <div className="relative z-10 space-y-1.5 py-3 border-b border-slate-100">
                  {(() => {
                    const sumEval = getSummaryDynamicIntensity(summary);
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-cobalt-500 pl-2">
                            Ringkasan Profil (Hook 6 Detik)
                          </h2>
                          {showOverlay && (
                            <span className={`px-1.5 py-0.5 rounded-[10px] text-caption font-bold z-30 ${
                              sumEval.intensity >= 0.84
                                ? 'bg-rose-600 text-white shadow-xs'
                                : sumEval.intensity >= 0.70
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {sumEval.label.includes('Wall of Text')
                                ? `Focus ${Math.round(sumEval.intensity * 100)}% (Terlalu Padat)`
                                : `Focus ${Math.round(sumEval.intensity * 100)}%`}
                            </span>
                          )}
                        </div>
                        <p
                          data-heatmap="summary"
                          data-heatmap-intensity={sumEval.intensity.toString()}
                          data-heatmap-label={sumEval.label}
                          className="text-xs text-slate-700 leading-relaxed font-normal inline-block"
                        >
                          {summary}
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Keahlian Utama (Core Skills) */}
                <div className="relative z-10 space-y-2 py-3 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-cobalt-500 pl-2">
                      Keahlian &amp; Kompetensi Inti
                    </h2>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-2 py-1 rounded-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 text-caption font-bold border border-orange-200 transition flex items-center gap-1 cursor-pointer pointer-events-auto shadow-2xs"
                      title="Tambah Tag Keahlian Baru"
                    >
                      <Plus className="w-3 h-3 text-orange-700" />
                      <span>Tambah Keahlian</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {primarySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        data-heatmap={`skill-${idx}`}
                        data-heatmap-intensity="0.78"
                        data-heatmap-label={`Skill: ${skill}`}
                        className="px-2.5 py-1 rounded-[8px] bg-slate-100 text-slate-800 text-caption font-bold border border-slate-200/80 inline-block"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pengalaman Kerja Utama (Primary Experience) */}
                <div className="relative z-10 space-y-3 py-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-cobalt-500 pl-2">
                      Pengalaman Kerja / Aktivitas Relevan
                    </h2>
                    {showOverlay && (
                      <span className="px-2 py-0.5 rounded-[10px] text-caption font-black bg-rose-600 text-white shadow-xs z-30">
                        Hotspot #2 (92%)
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {primaryExperience.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <h3
                            data-heatmap={`exp-role-${idx}`}
                            data-heatmap-intensity="0.90"
                            data-heatmap-label={`Role: ${exp.role}`}
                            className="font-bold text-xs text-slate-900 inline-block"
                          >
                            {exp.role} • <span className="text-navy-700 font-semibold">{exp.company}</span>
                          </h3>
                          <span className="text-caption text-slate-500 font-medium">{exp.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                          {(exp.achievements || []).map((ach, aIdx) => {
                            const bulletEval = getBulletDynamicIntensity(ach, 0.82);
                            return (
                              <li
                                key={aIdx}
                                data-heatmap={`exp-ach-${idx}-${aIdx}`}
                                data-heatmap-intensity={bulletEval.intensity.toString()}
                                data-heatmap-label={bulletEval.label}
                                className="leading-relaxed"
                              >
                                {ach}
                              </li>
                            );
                          })}
                        </ul>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddAchievement(exp.id)}
                            className="text-caption font-bold text-cobalt-500 hover:underline inline-flex items-center gap-1 cursor-pointer pointer-events-auto"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah Poin Tanggung Jawab</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Indicator Page 1 */}
                <div className="relative z-10 pt-3 border-t border-slate-100 flex justify-between items-center text-caption text-slate-600 font-medium">
                  <span>Dokumen Resmi • {candidateName}</span>
                  <span className="font-bold text-slate-600">Lembar 1 dari 2 (Standar Seleksi Awal)</span>
                </div>
              </>
          )}

          {/* ========================================================= */}
          {/* FALLBACK MODE: PAGE 2 CONTENT (THE PROOF)                 */}
          {/* ========================================================= */}
          {activePage === 2 && !isUsingCustomTemplate && (
            <>
              {/* Mini Header Page 2 */}
              <div className="relative z-10 border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-caption font-bold uppercase tracking-wider text-blue-600 block">
                    Lembar Verifikasi Kredensial
                  </span>
                  <h2 className="text-lg font-black text-slate-900">
                    {candidateName} • {roleTitle}
                  </h2>
                </div>
                <span className="text-caption text-slate-500 font-medium">{email}</span>
              </div>

              {/* Pengalaman Lanjutan / Proyek Mandiri */}
              <div className="relative z-10 space-y-2 py-3 border-b border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-blue-600 pl-2">
                  Pengalaman Pendukung / Proyek Mandiri
                </h3>
                {secondaryExperience.length > 0 ? (
                  <div className="space-y-3">
                    {secondaryExperience.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span
                            data-heatmap={`sec-exp-${idx}`}
                            data-heatmap-intensity="0.75"
                            data-heatmap-label={`Proyek: ${exp.role}`}
                            className="font-bold text-xs text-slate-900"
                          >
                            {exp.role} ({exp.company})
                          </span>
                          <span className="text-caption text-slate-500">{exp.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                          {(exp.achievements || []).map((ach, aIdx) => {
                            const bulletEval = getBulletDynamicIntensity(ach, 0.70);
                            return (
                              <li
                                key={aIdx}
                                data-heatmap={`sec-exp-ach-${idx}-${aIdx}`}
                                data-heatmap-intensity={bulletEval.intensity.toString()}
                                data-heatmap-label={bulletEval.label}
                                className="leading-relaxed"
                              >
                                {ach}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Proyek mandiri atau pengalaman magang tambahan tercatat di sini untuk memperkuat bukti portofolio.
                  </p>
                )}
              </div>

              {/* Riwayat Pendidikan Formal */}
              <div className="relative z-10 space-y-2 py-3 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-blue-600 pl-2">
                    Riwayat Pendidikan &amp; Pelatihan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-2 py-1 rounded-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 text-caption font-bold border border-orange-200 transition flex items-center gap-1 cursor-pointer pointer-events-auto shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-orange-700" />
                    <span>Tambah Pendidikan</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {cvEducation.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      data-heatmap={`edu-${idx}`}
                      data-heatmap-intensity="0.70"
                      data-heatmap-label={`Pendidikan: ${edu.institution}`}
                      className="flex justify-between items-baseline text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree}</span> •{' '}
                        <span className="text-navy-700 font-semibold">{edu.institution}</span>
                      </div>
                      <span className="text-caption text-slate-500 font-medium">
                        {edu.period} • {edu.gpa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sertifikasi & Informasi Tambahan */}
              <div className="relative z-10 space-y-2 py-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-l-3 border-blue-600 pl-2">
                    Sertifikasi Teknis &amp; Bahasa
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMiscPoint}
                    className="px-2 py-1 rounded-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 text-caption font-bold border border-orange-200 transition flex items-center gap-1 cursor-pointer pointer-events-auto shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-orange-700" />
                    <span>Tambah Baris</span>
                  </button>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-1">
                  {cvMiscPoints.map((misc, idx) => (
                    <li
                      key={idx}
                      data-heatmap={`misc-${idx}`}
                      data-heatmap-intensity="0.65"
                      data-heatmap-label={`Sertifikat: ${misc}`}
                    >
                      {misc}
                    </li>
                  ))}
                  {secondarySkills.length > 0 && (
                    <li className="pt-1 text-slate-600">
                      <strong>Keahlian Pendukung:</strong> {secondarySkills.join(', ')}
                    </li>
                  )}
                </ul>
              </div>

              {/* Footer Indicator Page 2 */}
              <div className="relative z-10 pt-3 border-t border-slate-100 flex justify-between items-center text-caption text-slate-600 font-medium">
                <span>Verifikasi Bukti Kredensial</span>
                <span className="font-bold text-blue-600">Lembar 2 dari 2 (Audit Lengkap)</span>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* PAGE 3 CONTENT: THE BLINDSPOT (AUDIT DIAGNOSTIC SHEET)    */}
          {/* ========================================================= */}
          {activePage === 3 && (
            <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden">
              {/* Background Technical Watermark & Wireframe Grid */}
              <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-8 opacity-15 overflow-hidden">
                <div className="space-y-4">
                  <div className="h-6 bg-slate-400 dark:bg-slate-600 rounded-[4px] w-1/3" />
                  <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded-[4px] w-2/3" />
                  <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded-[4px] w-1/2" />
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-[6px] w-full mt-4" />
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-[6px] w-full" />
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-[6px] w-full" />
                </div>
                <div className="text-center font-mono text-3xl font-black text-rose-500 uppercase tracking-widest rotate-[-18deg] my-auto">
                  ATTENTION DROPOUT • RETENSI 0%
                </div>
              </div>

              {/* Top Technical Preflight Banner */}
              <div className="relative z-10 flex items-center justify-between border-b border-rose-200 dark:border-rose-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Audit Halaman 3 • Zona Eliminasi HRD
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  95% Drop-Off
                </span>
              </div>

              {/* Center Technical Diagnostic Card */}
              <div className="relative z-10 my-auto max-w-lg w-full mx-auto bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                      Attention Dead Zone
                    </span>
                    <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                      Simulasi Tatapan 6 Detik
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Halaman 3 Tidak Pernah Dijangkau HRD
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Untuk kandidat usia 16–24 tahun, berkas lebih dari 2 lembar dinilai tidak mampu menyaring prioritas kerja dan diabaikan oleh 95% rekruter.
                  </p>
                </div>

                {/* 3 Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Peluang Baca</span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">&lt; 5%</span>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Durasi Tatap</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">0.0 Dtk</span>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Risiko Eliminasi</span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">Tinggi</span>
                  </div>
                </div>

                {/* Audit Action Checklist */}
                <div className="p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="text-caption font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Langkah Rekomendasi Pemadatan:</span>
                  </div>
                  <ul className="space-y-1 text-caption text-slate-600 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                    <li>Pangkas kalimat bertele-tele pada uraian tugas kerja (fokus metrik &amp; hasil).</li>
                    <li>Hapus riwayat SMP/SMA jika sudah menempuh kuliah atau lulus SMK vokasi.</li>
                    <li>Pindahkan portofolio panjang ke tautan ringkas di Halaman 1.</li>
                  </ul>
                </div>

                {/* Single Primary Action Button */}
                {onCondenseToOnePage && (
                  <button
                    type="button"
                    onClick={onCondenseToOnePage}
                    className="w-full py-2.5 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>Padatkan Otomatis ke 1 Halaman A4</span>
                  </button>
                )}
              </div>

              {/* Bottom Document Sheet Footer */}
              <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-caption text-slate-500 dark:text-slate-400 font-medium">
                <span>Simulasi Lembar 3 dari Dokumen Terdeteksi</span>
                <span className="font-mono text-[10px]">PREFLIGHT EYE-TRACKING AUDIT</span>
              </div>
            </div>
          )}

          {/* OVERLAY MODE: Bounding Box Wireframe Layer */}
          {activePage !== 3 && showOverlay && viewMode === 'bbox' && (
            <div className={`absolute inset-0 pointer-events-none z-30 ${isUsingCustomTemplate && domBoundingBoxes.length > 0 ? 'p-0' : 'p-10'}`}>
              {(isUsingCustomTemplate && domBoundingBoxes.length > 0 ? domBoundingBoxes : boundingBoxes || []).map((box) => {
                const isPixel = isUsingCustomTemplate && domBoundingBoxes.length > 0;
                return (
                  <div
                    key={box.id}
                    style={{
                      top: isPixel ? `${box.y}px` : `${box.y}%`,
                      left: isPixel ? `${box.x}px` : `${box.x}%`,
                      width: isPixel ? `${box.width}px` : `${box.width}%`,
                      height: isPixel ? `${box.height}px` : `${box.height}%`,
                    }}
                    className="absolute border-2 border-dashed border-cobalt-500/80 bg-cobalt-500/10 rounded-[8px] flex items-start justify-end p-1.5"
                  >
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black bg-[#132EA8] text-white shadow-xs">
                      {box.title} ({Math.round(box.visualWeight * 100)}% Weight)
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* OVERLAY MODE: Fixation Badges for Saccadic Scanpath (Pages 1 & 2) */}
          {activePage !== 3 && showOverlay && viewMode === 'f-pattern' && (
            <div className="absolute inset-0 pointer-events-none z-40">
              {(domFixations || []).map((fp) => {
                const anchorX = Math.max(16, fp.x);
                const anchorY = fp.y + Math.min(14, Math.max(8, fp.height * 0.35));
                return (
                  <div
                    key={fp.id}
                    style={{
                      top: `${anchorY}px`,
                      left: `${anchorX}px`,
                    }}
                    className="absolute -translate-y-1/2 flex items-center gap-1.5 transition-transform pointer-events-none"
                  >
                    <div className="w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-lg ring-2 bg-rose-600 ring-rose-200 shrink-0">
                      {fp.order}
                    </div>
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-slate-900/95 text-white shadow-md border border-slate-700 whitespace-nowrap backdrop-blur-xs">
                      {fp.label} ({Math.round(fp.intensity * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* OVERLAY MODE: ATS Matrix Layer */}
          {activePage !== 3 && showOverlay && viewMode === 'ats-matrix' && (
            <div className="absolute inset-0 pointer-events-none z-30 p-10 space-y-2 bg-slate-900/15 backdrop-blur-[0.5px]">
              <div className="p-4 bg-slate-900/90 text-white rounded-[10px] space-y-2 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-2 font-extrabold text-orange-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Analisis Korelasi Visibilitas Heatmap vs Kata Kunci ATS</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-caption">
                  {(atsCorrelations || []).slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-[8px] bg-slate-800 border border-slate-700 flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-200">{item.keyword}</span>
                      <span
                        className={`px-2 py-0.5 rounded-[6px] text-caption font-bold ${
                          item.quadrant === 'gold' ? 'bg-emerald-700 text-white' : 'bg-amber-700 text-slate-950'
                        }`}
                      >
                        {item.quadrant === 'gold' ? 'Area Emas' : 'Low ATS Keyword'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
