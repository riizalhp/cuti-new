'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CareerAssessment,
  CompetencyScoreResult,
  SkillGapItem,
  CareerDirectionItem,
} from '@/lib/career-intelligence-engine';
import { careerIntelligenceApi } from '@/lib/api';
import { getLokerUrl } from '@/lib/urls';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import { EvidenceSlideOver } from './EvidenceSlideOver';
import {
  Compass,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Layers,
  ExternalLink,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { CvScopeSelector } from '@/components/ui/CvScopeSelector';
import { PageHeader } from '@/components/ui/PageHeader';

export type CareerIntelligenceMode = 'discovery' | 'diagnostic';
export type DiagnosticSubTab = 'overview' | 'competencies' | 'skill-gap';

export const CareerIntelligenceView: React.FC = () => {
  const toast = useToast();
  const [activeMode, setActiveMode] = useState<CareerIntelligenceMode>('discovery');
  const [diagnosticSubTab, setDiagnosticSubTab] = useState<DiagnosticSubTab>('overview');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assessment, setAssessment] = useState<CareerAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string>('all');
  const [isUpdatingScope, setIsUpdatingScope] = useState(false);
  const [selectedCompetencyForDrawer, setSelectedCompetencyForDrawer] =
    useState<CompetencyScoreResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');

  const handleCustomRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customRoleInput.trim();
    if (!clean) return;
    setIsCustomModalOpen(false);
    setCustomRoleInput('');
    await handleRoleChange(clean);
    setActiveMode('diagnostic');
  };

  // Ambil data assessment
  const loadAssessment = async (roleId?: string, cvId?: string) => {
    try {
      setIsLoading(true);
      const activeCv = cvId !== undefined ? cvId : selectedCvId;
      const data = await careerIntelligenceApi.get(roleId, activeCv);
      if (data) {
        setAssessment(data);
        if (data.selectedCvScope?.id) {
          setSelectedCvId(data.selectedCvScope.id);
        }
      }
    } catch (error) {
      console.error('[CareerIntelligenceView] Failed to load:', error);
      toast.error('Gagal Memuat Analisis', 'Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, []);

  // Ganti target role
  const handleRoleChange = async (newRoleId: string) => {
    if (!newRoleId || newRoleId === assessment?.targetRole.id) return;
    try {
      setIsUpdatingRole(true);
      const updated = await careerIntelligenceApi.setTargetRole(newRoleId, selectedCvId);
      if (updated) {
        setAssessment(updated);
        toast.success('Target Analisis Diperbarui', `Target beralih ke: ${updated.targetRole.title}`);
      }
    } catch (error) {
      console.error('[CareerIntelligenceView] Role update failed:', error);
      toast.error('Gagal Mengubah Target', 'Terjadi kesalahan sistem saat mengubah target analisis.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Ganti basis analisis dokumen CV (Scope Selector)
  const handleCvScopeChange = async (newCvId: string) => {
    if (newCvId === selectedCvId) return;
    try {
      setIsUpdatingScope(true);
      setSelectedCvId(newCvId);
      const updated = await careerIntelligenceApi.get(assessment?.targetRole.id, newCvId);
      if (updated) {
        setAssessment(updated);
        const cvTitle =
          newCvId === 'all'
            ? 'Semua Dokumen (Portofolio Holistik)'
            : updated.availableCvs?.find((c: { id: string; title: string }) => c.id === newCvId)?.title || 'Dokumen CV Terpilih';
        toast.success('Basis Dokumen Diperbarui', `Analisis kini menggunakan: ${cvTitle}`);
      }
    } catch (error) {
      console.error('[CareerIntelligenceView] CV scope update failed:', error);
      toast.error('Gagal Mengubah Basis', 'Terjadi kendala saat memperbarui basis dokumen analisis.');
    } finally {
      setIsUpdatingScope(false);
    }
  };

  const handleDrilldownToRole = async (roleId: string) => {
    setActiveMode('diagnostic');
    if (roleId !== assessment?.targetRole.id) {
      await handleRoleChange(roleId);
    }
  };

  const openEvidenceDrawer = (comp: CompetencyScoreResult) => {
    setSelectedCompetencyForDrawer(comp);
    setIsDrawerOpen(true);
  };

  // Daftar kategori unik untuk filter di Mode Discovery
  const availableCategories = useMemo(() => {
    if (!assessment?.careerDirections) return [];
    const set = new Set<string>();
    assessment.careerDirections.forEach((dir) => {
      if (dir.category) set.add(dir.category);
    });
    return Array.from(set);
  }, [assessment?.careerDirections]);

  const filteredDirections = useMemo(() => {
    if (!assessment?.careerDirections) return [];
    if (categoryFilter === 'all') return assessment.careerDirections;
    return assessment.careerDirections.filter((dir) => dir.category === categoryFilter);
  }, [assessment?.careerDirections, categoryFilter]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse motion-reduce:animate-none">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-64" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="py-16 px-6 text-center max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 mx-auto flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Analisis Karier Belum Tersedia</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sistem belum menemukan draf CV atau asesmen aktif untuk dianalisis. Susun CV atau coba muat kembali analisis.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="primary" size="sm" onClick={() => loadAssessment()}>
            Coba Muat Ulang
          </Button>
          <Link
            href="/cv"
            className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            Buat CV Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const {
    targetRole,
    roleFitScore,
    roleFitLabel,
    readinessScore,
    topStrengths,
    priorityGaps,
    careerDirections,
    nextBestMove,
    isBenchmarkMode,
    selectedCvScope,
    availableCvs,
  } = assessment;

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Wayfinding Banner) */}
      <PageHeader
        title="Career Intelligence"
        subtitle={
          activeMode === 'discovery'
            ? 'Memetakan modal keahlian dari profil dan CV untuk menemukan pilihan profesi yang paling cocok di pasar kerja.'
            : isBenchmarkMode
            ? `Eksplorasi standar acuan kompetensi pasar kerja untuk posisi ${targetRole.title}.`
            : `Membedah kesiapanmu untuk posisi ${targetRole.title}, standar industri rekruter, dan langkah nyata menutup kekurangan.`
        }
        icon={Compass}
        badge={
          isBenchmarkMode
            ? 'Standar Industri'
            : activeMode === 'discovery'
            ? 'Peta Peluang'
            : 'Diagnostik Target'
        }
        stats={
          activeMode === 'discovery'
            ? [
                {
                  label: 'Peluang Cocok',
                  value: `${careerDirections.length} Profesi`,
                  icon: TrendingUp,
                  colorClass: 'text-emerald-300',
                  isPrimary: true,
                },
                {
                  label: 'Kesiapan Portofolio',
                  value: `${readinessScore}%`,
                  icon: ShieldCheck,
                  colorClass: 'text-indigo-300',
                },
              ]
            : [
                {
                  label: 'Role Fit',
                  value: `${roleFitScore}%`,
                  icon: Target,
                  colorClass:
                    roleFitScore >= 75
                      ? 'text-emerald-300'
                      : roleFitScore >= 50
                      ? 'text-amber-300'
                      : 'text-rose-300',
                  isPrimary: true,
                },
                {
                  label: 'Kesiapan',
                  value: `${readinessScore}%`,
                  icon: TrendingUp,
                  colorClass: 'text-indigo-300',
                },
              ]
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Basis Analisis CV Selector */}
            {availableCvs && availableCvs.length > 0 && (
              <CvScopeSelector
                cvs={availableCvs}
                selectedCvId={selectedCvId}
                onChange={(newCvId) => handleCvScopeChange(newCvId)}
                allowAll
                allLabel="Semua Dokumen (Holistik)"
                label="Basis Analisis"
              />
            )}

            <IconButton
              variant="subtle"
              size="sm"
              className="h-[36px] w-[36px] cursor-pointer"
              label="Perbarui Analisis Data"
              onClick={() => loadAssessment(targetRole.id, selectedCvId)}
              disabled={isLoading || isUpdatingRole || isUpdatingScope}
            >
              <RefreshCw
                className={cn(
                  'w-3.5 h-3.5 text-white',
                  (isLoading || isUpdatingRole || isUpdatingScope) && 'animate-spin'
                )}
              />
            </IconButton>
          </div>
        }
      />

      {/* 2. DUAL-MODE SWITCHER (Peta Peluang vs Uji Target Posisi) */}
      <div className="p-1.5 rounded-[12px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Mode 1: Peta Peluang Karier */}
          <button
            onClick={() => setActiveMode('discovery')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-2.5 rounded-[9px] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer',
              activeMode === 'discovery'
                ? 'bg-white dark:bg-slate-900 text-cobalt-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
            aria-pressed={activeMode === 'discovery'}
          >
            <Compass className="w-4 h-4 text-cobalt-500 shrink-0" />
            <span>Peta Peluang Karier</span>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-cobalt-700 dark:text-blue-300">
              {careerDirections.length} Cocok
            </span>
          </button>

          {/* Mode 2: Uji Target Posisi */}
          <button
            onClick={() => setActiveMode('diagnostic')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-2.5 rounded-[9px] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer',
              activeMode === 'diagnostic'
                ? 'bg-white dark:bg-slate-900 text-cobalt-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
            aria-pressed={activeMode === 'diagnostic'}
          >
            <Target className="w-4 h-4 text-cobalt-500 shrink-0" />
            <span>Uji Target Posisi</span>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 max-w-[120px] truncate">
              {targetRole.title}
            </span>
          </button>
        </div>

        {/* Info Helper Label */}
        <div className="hidden lg:flex items-center gap-2 pr-3 text-caption text-slate-500 dark:text-slate-400">
          {activeMode === 'discovery' ? (
            <span>Melihat opsi pekerjaan yang paling terbuka dari modal CV saat ini</span>
          ) : (
            <span>Menguji kesesuaian dan kesenjangan skill terhadap posisi pilihanmu</span>
          )}
        </div>
      </div>

      {/* BENCHMARK MODE BANNER (Untuk user belum punya CV) */}
      {isBenchmarkMode && (
        <div className="p-5 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-bold bg-cobalt-500 text-white uppercase tracking-wider">
                Mode Standar Industri
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Peta Acuan Kompetensi Perekrut
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Gunakan peta acuan kompetensi untuk posisi <strong>{targetRole.title}</strong> ini sebagai panduan keahlian sebelum menyusun CV pertamamu.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cv"
              className="px-4 py-2.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Susun CV {targetRole.title}
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE A: PETA PELUANG KARIER (CAREER DISCOVERY / OUTWARD EXPLORATION)       */}
      {/* ========================================================================= */}
      {activeMode === 'discovery' && (
        <div className="space-y-6">
          {/* Header Card: Ringkasan Modal Diri */}
          <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Modal Karier Terdata
                </span>
                <span className="px-2 py-0.5 rounded-[6px] text-caption font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {assessment.profileCompleteness.percentage}% Data Lengkap
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Rekomendasi Profesi Berdasarkan Modal Keahlianmu
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Diurutkan berdasarkan kemudahan transisi dan kesesuaian keahlian yang sudah kamu miliki pada{' '}
                <strong>
                  {selectedCvScope?.id === 'all'
                    ? 'seluruh dokumen portofolio'
                    : `dokumen "${selectedCvScope?.title}"`}
                </strong>.
              </p>
            </div>

            {/* Quick Button to Switch or Add Custom Target */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-3.5 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Punya Target Lain?</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          {availableCategories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-[10px] text-xs font-bold transition shrink-0 cursor-pointer',
                  categoryFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                )}
              >
                Semua Bidang ({careerDirections.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-[10px] text-xs font-bold transition shrink-0 cursor-pointer',
                    categoryFilter === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Career Directions Grid */}
          {filteredDirections.length === 0 ? (
            <div className="p-8 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tidak ada profesi yang cocok pada kategori ini.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setCategoryFilter('all')}>
                Tampilkan Semua Bidang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDirections.map((dir, index) => {
                const isCurrentTarget = dir.roleId === targetRole.id;
                return (
                  <div
                    key={dir.roleId}
                    className={cn(
                      'p-5 rounded-[10px] border bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 transition-all',
                      isCurrentTarget
                        ? 'border-cobalt-400/80 dark:border-blue-700/80 ring-1 ring-cobalt-400/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Category + Fit Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-caption font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {dir.category}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Kecocokan Tertinggi
                              </span>
                            )}
                            {isCurrentTarget && (
                              <span className="px-2 py-0.2 rounded-full text-[9.5px] font-bold bg-blue-100 text-cobalt-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Target Aktif
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {dir.title}
                          </h3>
                        </div>

                        {/* Fit Score Badge */}
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline justify-end gap-1">
                            <span
                              className={cn(
                                'text-2xl font-extrabold',
                                dir.fitScore >= 75
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : dir.fitScore >= 50
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-cobalt-600 dark:text-blue-400'
                              )}
                            >
                              {dir.fitScore}%
                            </span>
                          </div>
                          <span className="text-caption font-bold text-slate-500 dark:text-slate-400">
                            {dir.fitLabel}
                          </span>
                        </div>
                      </div>

                      {/* Transition Effort Tag */}
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-slate-500 dark:text-slate-400">
                          Tingkat Transisi:
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-[10px] text-caption font-bold border',
                            dir.transitionEffort === 'Rendah'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : dir.transitionEffort === 'Sedang'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          )}
                        >
                          {dir.transitionEffort === 'Rendah'
                            ? 'Transisi Mudah (Banyak Skill Relevan)'
                            : dir.transitionEffort === 'Sedang'
                            ? 'Transisi Sedang'
                            : 'Perlu Waktu Belajar Tambahan'}
                        </span>
                      </div>

                      {/* Transferable Skills (Modal yang sudah ada) */}
                      {dir.transferableSkills.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-caption font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            Keahlian yang Sudah Kamu Miliki:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dir.transferableSkills.map((sk, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-[8px] bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-caption font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Competencies (Perlu diperkuat) */}
                      {dir.missingCompetencies.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-caption font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                            Perlu Diperkuat untuk Posisi Ini:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {dir.missingCompetencies.map((ms, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-caption font-medium"
                              >
                                {ms}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Career Path Timeline */}
                      <div className="space-y-1 pt-1">
                        <span className="text-caption font-bold text-slate-700 dark:text-slate-300">
                          Jalur Jenjang Karier:
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto no-scrollbar">
                          {dir.careerPath.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <span className="px-2 py-1 rounded-[8px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-[10.5px] font-medium whitespace-nowrap">
                                {step}
                              </span>
                              {idx < dir.careerPath.length - 1 && (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 dark:text-slate-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={getLokerUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-cobalt-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat Lowongan Terbuka
                      </a>

                      <button
                        onClick={() => handleDrilldownToRole(dir.roleId)}
                        disabled={isUpdatingRole}
                        className="px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Uji Detail Posisi Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Card: Ingin mengecek posisi impian lain? */}
          <div className="p-5 rounded-[10px] border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Punya Target Pekerjaan Spesifik?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jika kamu sudah mengincar posisi tertentu yang belum ada di daftar rekomendasi di atas, masukkan posisinya untuk langsung menguji kesiapanmu.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setIsCustomModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ketik Target Posisi Baru
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: DIAGNOSTIK TARGET POSISI (TARGET GAP & READINESS ANALYSIS)        */}
      {/* ========================================================================= */}
      {activeMode === 'diagnostic' && (
        <div className="space-y-6">
          {/* Target Selector Toolbar */}
          <div className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                Target Posisi yang Diuji:
              </span>

              {/* Dropdown Role Selector */}
              <select
                value={targetRole.id}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomModalOpen(true);
                  } else {
                    handleRoleChange(e.target.value);
                  }
                }}
                disabled={isUpdatingRole}
                className="px-3 py-1.5 rounded-[8px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                aria-label="Pilih Target Posisi untuk Dianalisis"
              >
                {assessment.availableRoles.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.title} ({r.categoryLabel})
                  </option>
                ))}
                <option value="__custom__" className="dark:bg-slate-900 font-semibold text-cobalt-500">
                  + Ganti / Tambah Posisi Lain...
                </option>
              </select>

              <IconButton
                variant="subtle"
                size="sm"
                className="h-[32px] w-[32px] cursor-pointer"
                label="Tambah Target Posisi Kustom"
                onClick={() => setIsCustomModalOpen(true)}
                disabled={isUpdatingRole}
              >
                <Plus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              </IconButton>
            </div>

            {/* Link Switch Back to Discovery */}
            <button
              onClick={() => setActiveMode('discovery')}
              className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              Bandingkan dengan Posisi Lain
            </button>
          </div>

          {/* Top Bento Row: Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Role Fit Score */}
            <div className="md:col-span-4 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kecocokan Role
                  </span>
                  <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-blue-50 text-cobalt-500 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {targetRole.title}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {roleFitScore}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Skor Kecocokan
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  Status: <strong className="text-slate-900 dark:text-slate-200">{roleFitLabel}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDiagnosticSubTab('competencies')}
                  className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Lihat Detail 5 Pilar Kompetensi <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Kesiapan Karier */}
            <div className="md:col-span-4 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kesiapan Portofolio
                  </span>
                  <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {assessment.profileCompleteness.percentage}% Lengkap
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {readinessScore}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Career Readiness
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Berdasarkan kelengkapan CV, keahlian terdata, dan riwayat lamaran yang aktif.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/readiness"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Periksa Pilar Kesiapan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Rekomendasi Langkah Terbaik (Next Move) */}
            <div className="md:col-span-4 p-5 rounded-[10px] border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cobalt-500 dark:text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Langkah Terbaik
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {nextBestMove.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {nextBestMove.description}
                </p>
              </div>

              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={nextBestMove.actionUrl}
                  className="px-3.5 py-2 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                >
                  {nextBestMove.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {nextBestMove.secondaryActionUrl && (
                  <Link
                    href={nextBestMove.secondaryActionUrl}
                    className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition"
                  >
                    {nextBestMove.secondaryActionLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Tabs Diagnostik Target */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setDiagnosticSubTab('overview')}
              className={cn(
                'px-3.5 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-1.5 cursor-pointer',
                diagnosticSubTab === 'overview'
                  ? 'border-cobalt-500 text-cobalt-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ringkasan Radar</span>
            </button>
            <button
              onClick={() => setDiagnosticSubTab('competencies')}
              className={cn(
                'px-3.5 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-1.5 cursor-pointer',
                diagnosticSubTab === 'competencies'
                  ? 'border-cobalt-500 text-cobalt-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Rincian 5 Pilar Kompetensi</span>
            </button>
            <button
              onClick={() => setDiagnosticSubTab('skill-gap')}
              className={cn(
                'px-3.5 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-1.5 cursor-pointer',
                diagnosticSubTab === 'skill-gap'
                  ? 'border-cobalt-500 text-cobalt-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Kesenjangan Skill Prioritas</span>
              {priorityGaps.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {priorityGaps.length}
                </span>
              )}
            </button>
          </div>

          {/* SUB-TAB 1: RINGKASAN RADAR & STRENGTHS */}
          {diagnosticSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Radar Card */}
              <div className="lg:col-span-6 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
                    Peta Radar Kompetensi Posisi: {targetRole.title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {assessment.competencies.length} Area Kunci
                  </span>
                </div>

                <div className="my-2 w-full flex justify-center">
                  <CompetencyRadarChart
                    competencies={assessment.competencies}
                    onSelectCompetency={openEvidenceDrawer}
                  />
                </div>

                <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => setDiagnosticSubTab('competencies')}
                    className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Buka Rincian Nilai & Bukti Lengkap →
                  </button>
                </div>
              </div>

              {/* Strengths & Priority Gaps Preview */}
              <div className="lg:col-span-6 space-y-5">
                {/* Box Kekuatan Utama */}
                <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      Kekuatan Utama Kamu
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Nilai Tertinggi</span>
                  </div>

                  <div className="space-y-2.5">
                    {topStrengths.length > 0 ? (
                      topStrengths.map((comp) => (
                        <div
                          key={comp.id}
                          className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {comp.name}
                            </div>
                            <div className="text-caption text-slate-500 dark:text-slate-400">
                              Standar acuan posisi: {comp.requiredScore}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                              {comp.currentScore}
                            </span>
                            <button
                              onClick={() => openEvidenceDrawer(comp)}
                              className="text-caption font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Bukti
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Belum ada bukti keahlian yang terdata
                        </p>
                        <p className="text-caption text-slate-500 dark:text-slate-400">
                          {isBenchmarkMode
                            ? 'Lengkapi atau sesuaikan CV Anda agar sistem dapat memvalidasi keahlian riil.'
                            : 'Tambahkan pengalaman atau keterampilan ke CV untuk menampilkan kekuatan utama.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Box Kesenjangan Prioritas Preview */}
                <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      Kesenjangan Skill Prioritas
                    </h3>
                    <button
                      onClick={() => setDiagnosticSubTab('skill-gap')}
                      className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Lihat Semua ({priorityGaps.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {priorityGaps.slice(0, 2).map((gap) => (
                      <div
                        key={gap.competencyId}
                        className="p-3 rounded-[10px] bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {gap.name}
                          </div>
                          <span className="px-2 py-0.5 rounded-[10px] text-caption font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {gap.currentScore} → {gap.requiredScore}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {gap.suggestedAction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: RINCIAN 5 PILAR KOMPETENSI */}
          {diagnosticSubTab === 'competencies' && (
            <div className="space-y-4">
              <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Evaluasi Detail 5 Area Kompetensi: {targetRole.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dihitung dari bukti riil pada dokumen CV dan pengalamanmu dibanding standar acuan industri perekrut.
                </p>
              </div>

              <div className="space-y-3">
                {assessment.competencies.map((comp) => {
                  const isMet = comp.currentScore >= comp.requiredScore;
                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {comp.name}
                          </h4>
                          <span className="text-caption text-slate-500 dark:text-slate-400">
                            Keyakinan data: {comp.confidence} ({comp.evidence.length} bukti ditemukan)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {comp.currentScore}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {' '}
                            / {comp.requiredScore}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Current vs Required */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            isMet ? 'bg-emerald-500' : 'bg-cobalt-500'
                          )}
                          style={{ width: `${Math.min(100, comp.currentScore)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-caption text-slate-600 dark:text-slate-400 line-clamp-1">
                          {comp.suggestedAction}
                        </span>
                        <button
                          onClick={() => openEvidenceDrawer(comp)}
                          className="text-xs font-bold text-cobalt-500 dark:text-blue-400 hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          Lihat Bukti CV
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: KESENJANGAN SKILL PRIORITAS */}
          {diagnosticSubTab === 'skill-gap' && (
            <div className="space-y-4">
              <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Prioritas Kesenjangan Skill ({targetRole.title})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Fokuskan waktu belajar dan perbaikan CV pada area yang memiliki bobot kelulusan tertinggi bagi perekrut.
                </p>
              </div>

              <div className="space-y-4">
                {priorityGaps.map((gap, index) => (
                  <div
                    key={gap.competencyId}
                    className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
                          0{index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {gap.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-[10px] text-caption font-bold border',
                            gap.priority === 'Tinggi'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : gap.priority === 'Sedang'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          )}
                        >
                          {gap.priorityLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Saat Ini: {gap.currentScore} / Target: {gap.requiredScore}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400" />
                          Mengapa Ini Berpengaruh?
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {gap.whyItMatters}
                        </p>
                      </div>

                      <div className="p-3 rounded-[10px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          Rekomendasi Langkah Praktis:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {gap.suggestedAction}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <Link
                        href="/cv"
                        className="px-3.5 py-1.5 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        Sesuaikan di CV <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Bridge: Mau cari peluang lain? */}
          <div className="p-4 rounded-[10px] bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-700 dark:text-slate-300">
              Ingin membandingkan peluang dengan alternatif profesi lain yang cocok dari modal CV ini?
            </span>
            <button
              onClick={() => setActiveMode('discovery')}
              className="font-bold text-cobalt-500 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              Buka Peta Peluang Karier <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Tentukan Target Posisi Baru */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="max-w-md p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Tentukan Target Posisi Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ketik nama posisi pekerjaan yang ingin Anda tuju. Sistem akan menganalisis kesesuaian dokumen dan profil Anda terhadap standar kompetensi posisi tersebut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCustomRoleSubmit} className="space-y-4">
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="Contoh: Staff Logistik, Akuntan, Graphic Designer..."
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cobalt-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!customRoleInput.trim() || isUpdatingRole}
                loading={isUpdatingRole}
              >
                Simpan & Analisis
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Slide-in Drawer untuk Bukti Kompetensi */}
      <EvidenceSlideOver
        isOpen={isDrawerOpen}
        competency={selectedCompetencyForDrawer}
        onClose={() => setIsDrawerOpen(false)}
        targetRoleTitle={targetRole.title}
      />
    </div>
  );
};
