'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CareerAssessment,
  CompetencyScoreResult,
  SkillGapItem,
  CareerDirectionItem,
} from '@/lib/career-intelligence-engine';
import { careerIntelligenceApi } from '@/lib/api';
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
  ChevronDown,
  Layers,
  BarChart3,
  ExternalLink,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

type InternalTab = 'overview' | 'role-fit' | 'skill-gap' | 'career-direction';

export const CareerIntelligenceView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<InternalTab>('overview');
  const [assessment, setAssessment] = useState<CareerAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string>('all');
  const [isUpdatingScope, setIsUpdatingScope] = useState(false);
  const [selectedCompetencyForDrawer, setSelectedCompetencyForDrawer] = useState<CompetencyScoreResult | null>(null);
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
      toast.error('Gagal memuat analisis karier. Silakan coba kembali.');
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
        toast.success(`Target analisis beralih ke: ${updated.targetRole.title}`);
      }
    } catch (error) {
      console.error('[CareerIntelligenceView] Role update failed:', error);
      toast.error('Gagal mengubah target analisis.');
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
        toast.success(`Basis analisis: ${cvTitle}`);
      }
    } catch (error) {
      console.error('[CareerIntelligenceView] CV scope update failed:', error);
      toast.error('Gagal memperbarui basis dokumen analisis.');
    } finally {
      setIsUpdatingScope(false);
    }
  };

  const openEvidenceDrawer = (comp: CompetencyScoreResult) => {
    setSelectedCompetencyForDrawer(comp);
    setIsDrawerOpen(true);
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-64" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-[10px] w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-[10px]" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Gagal memuat data analisis. Silakan muat ulang halaman.
      </div>
    );
  }

  const { targetRole, roleFitScore, roleFitLabel, readinessScore, topStrengths, priorityGaps, careerDirections, nextBestMove, isBenchmarkMode, selectedCvScope, availableCvs } = assessment;

  return (
    <div className="space-y-6">
      {/* Top Header & Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1738D1] dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {isBenchmarkMode ? 'Standar Industri' : 'Decision Layer'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Diperbarui: {assessment.lastEvaluatedAt}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Career Intelligence
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {isBenchmarkMode
              ? `Eksplorasi standar acuan kompetensi pasar kerja untuk posisi ${targetRole.title}.`
              : 'Menganalisis posisi karier Anda saat ini, peluang role yang cocok, dan langkah konkret untuk mencapainya.'}
          </p>
        </div>

        {/* Target Role Selector, CV Scope Selector & Refresh Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Role Selector */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
              <Target className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target:</span>
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
                className="text-xs font-bold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
                aria-label="Pilih Target Role untuk Dianalisis"
              >
                {assessment.availableRoles.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-slate-900">
                    {r.title} ({r.categoryLabel})
                  </option>
                ))}
                <option value="__custom__" className="dark:bg-slate-900 font-semibold text-[#1738D1]">
                  + Ganti / Tambah Posisi Lain...
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              disabled={isUpdatingRole}
              className="p-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#1738D1] cursor-pointer"
              title="Tentukan target posisi pekerjaan baru"
              aria-label="Tentukan target posisi pekerjaan baru"
            >
              <Plus className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
            </button>
          </div>

          {/* Basis Analisis CV Selector (Muncul jika ada dokumen CV) */}
          {availableCvs && availableCvs.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Basis:</span>
              <select
                value={selectedCvId}
                onChange={(e) => handleCvScopeChange(e.target.value)}
                disabled={isUpdatingScope || isLoading}
                className="text-xs font-bold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-1 max-w-[200px] truncate"
                aria-label="Pilih Dokumen CV untuk Basis Analisis"
              >
                <option value="all" className="dark:bg-slate-900">
                  Semua Dokumen (Portofolio Holistik)
                </option>
                {availableCvs.map((cv) => (
                  <option key={cv.id} value={cv.id} className="dark:bg-slate-900">
                    CV: {cv.title} {cv.targetPosition ? `(${cv.targetPosition})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => loadAssessment(targetRole.id, selectedCvId)}
            disabled={isLoading || isUpdatingRole || isUpdatingScope}
            className="p-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
            title="Perbarui Analisis Data"
            aria-label="Perbarui Analisis Data"
          >
            <RefreshCw className={cn('w-4 h-4', (isLoading || isUpdatingRole || isUpdatingScope) && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* BENCHMARK MODE BANNER (Untuk user belum punya CV/keahlian) */}
      {isBenchmarkMode && (
        <div className="p-5 rounded-[10px] bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold bg-[#1738D1] text-white uppercase tracking-wider">
                Mode Standar Industri
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Peta Acuan Kompetensi Perekrut
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Anda belum memiliki dokumen CV atau keahlian tersimpan. Di bawah ini adalah peta radar kompetensi standar industri yang disyaratkan untuk posisi <strong>{targetRole.title}</strong>. Jadikan standar ini sebagai acuan saat menyusun dokumen lamaran pertama Anda.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cv"
              className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Susun CV {targetRole.title}
            </Link>
          </div>
        </div>
      )}

      {/* SCOPE NOTICES (Untuk user dengan dokumen CV) */}
      {!isBenchmarkMode && selectedCvScope && selectedCvScope.id !== 'all' && (
        <div className="p-3.5 rounded-[10px] bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Evaluasi dihitung khusus dari dokumen: <strong>{selectedCvScope.title}</strong>
              {selectedCvScope.targetPosition ? ` (Target: ${selectedCvScope.targetPosition})` : ''}.
              Bukti dari CV lain tidak dicampuradukkan agar akurat saat Anda melamar.
            </span>
          </div>
          <button
            onClick={() => handleCvScopeChange('all')}
            className="font-bold text-[#1738D1] dark:text-blue-400 hover:underline cursor-pointer text-[11px]"
          >
            Beralih ke Gabungan Seluruh CV (Holistik)
          </button>
        </div>
      )}

      {!isBenchmarkMode && selectedCvScope?.id === 'all' && availableCvs && availableCvs.length > 1 && (
        <div className="p-3.5 rounded-[10px] bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1738D1] shrink-0" />
            <span>
              Mode Holistik aktif: Menganalisis gabungan <strong>{availableCvs.length} dokumen CV</strong>. Jika Anda ingin menguji kelayakan lembar lamaran spesifik sebelum dikirim ke HRD, pilih dokumen tersebut pada menu <strong>Basis</strong> di atas.
            </span>
          </div>
        </div>
      )}

      {/* Internal Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-px">
        {[
          { id: 'overview', label: 'Ringkasan', icon: Compass },
          { id: 'role-fit', label: 'Kecocokan Role', icon: Target },
          { id: 'skill-gap', label: 'Kesenjangan Skill', icon: AlertTriangle },
          { id: 'career-direction', label: 'Arah Karier', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InternalTab)}
              className={cn(
                'px-4 py-2.5 rounded-t-[10px] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap',
                isActive
                  ? 'border-[#1738D1] text-[#1738D1] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RINGKASAN (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Bento Row: Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Role Fit Score */}
            <div className="md:col-span-4 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kecocokan Role
                  </span>
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-blue-50 text-[#1738D1] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
                  onClick={() => setActiveTab('role-fit')}
                  className="text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Lihat Detail Perhitungan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Kesiapan Karier Keseluruhan */}
            <div className="md:col-span-4 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kesiapan Karier
                  </span>
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {assessment.profileCompleteness.percentage}% Data Lengkap
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#1738D1] dark:text-blue-400 flex items-center gap-1.5">
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
                  className="px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
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

          {/* Middle Bento Row: Radar Chart & Top Strengths vs Priority Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Visual Radar Card */}
            <div className="lg:col-span-6 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center justify-between">
              <div className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />
                  Peta Radar Kompetensi
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
                  onClick={() => setActiveTab('role-fit')}
                  className="text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
                >
                  Buka Rincian Nilai & Bukti Lengkap
                </button>
              </div>
            </div>

            {/* Strengths & Gaps Column */}
            <div className="lg:col-span-6 space-y-5">
              {/* Box Kekuatan Utama */}
              <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Kekuatan Terbesar Anda
                  </h3>
                  <span className="text-xs text-slate-400">Nilai Tertinggi</span>
                </div>

                <div className="space-y-2.5">
                  {topStrengths.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {comp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Standar role: {comp.requiredScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {comp.currentScore}
                          </span>
                        </div>
                        <button
                          onClick={() => openEvidenceDrawer(comp)}
                          className="text-[11px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Bukti
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Kesenjangan Prioritas */}
              <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Kesenjangan Skill Prioritas
                  </h3>
                  <button
                    onClick={() => setActiveTab('skill-gap')}
                    className="text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
                  >
                    Lihat Semua
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
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          {gap.currentScore} $\rightarrow$ {gap.requiredScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {gap.suggestedAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KECOCOKAN ROLE (ROLE FIT) */}
      {activeTab === 'role-fit' && (
        <div className="space-y-6">
          <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Evaluasi Kecocokan Posisi: {targetRole.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Skor kecocokan role dihitung dengan membandingkan bukti capaian profil dan dokumen CV Anda terhadap 5 area kompetensi kunci standar rekrutmen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Visual Radar Kiri */}
            <div className="lg:col-span-5 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Grafik Perbandingan Kemampuan
              </h3>
              <CompetencyRadarChart
                competencies={assessment.competencies}
                onSelectCompetency={openEvidenceDrawer}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-3">
                Klik pada salah satu titik kompetensi untuk membuka rincian bukti pendukung.
              </p>
            </div>

            {/* List Kompetensi Kanan */}
            <div className="lg:col-span-7 space-y-3">
              {assessment.competencies.map((comp) => {
                const isMet = comp.currentScore >= comp.requiredScore;
                return (
                  <div
                    key={comp.id}
                    className="p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {comp.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Keyakinan data: {comp.confidence} ({comp.evidence.length} bukti ditemukan)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {comp.currentScore}
                        </span>
                        <span className="text-xs text-slate-400"> / {comp.requiredScore}</span>
                      </div>
                    </div>

                    {/* Progress Bar Current vs Required */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isMet ? 'bg-emerald-500' : 'bg-[#1738D1]'
                        )}
                        style={{ width: `${Math.min(100, comp.currentScore)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                        {comp.suggestedAction}
                      </span>
                      <button
                        onClick={() => openEvidenceDrawer(comp)}
                        className="text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline shrink-0 ml-2 cursor-pointer"
                      >
                        Lihat Bukti
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KESENJANGAN SKILL (SKILL GAP) */}
      {activeTab === 'skill-gap' && (
        <div className="space-y-6">
          <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Prioritas Kesenjangan Skill ({targetRole.title})
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Fokuskan waktu belajar dan penyempurnaan CV Anda pada area yang memiliki bobot kelulusan tertinggi bagi perekrut.
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
                    <span className="w-6 h-6 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {gap.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold border',
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
                      Nilai Saat Ini: {gap.currentScore} / Target: {gap.requiredScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
                      Mengapa Ini Berpengaruh?
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {gap.whyItMatters}
                    </p>
                  </div>

                  <div className="p-3 rounded-[10px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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
                    className="px-3.5 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    Sesuaikan di CV <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARAH KARIER (CAREER DIRECTION) */}
      {activeTab === 'career-direction' && (
        <div className="space-y-6">
          <div className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Eksplorasi Alternatif Jalur Karier
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Berdasarkan modal keahlian dan pengalaman Anda saat ini, berikut adalah opsi posisi lain yang memiliki tingkat kecocokan tinggi dan transisi yang realistis.
            </p>
          </div>

          {careerDirections.length === 0 ? (
            <div className="p-8 rounded-[10px] border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belum ada alternatif transisi yang terdaftar untuk posisi {targetRole.title}. Buat dokumen CV baru dengan target posisi berbeda untuk membandingkan kecocokan karier Anda.
              </p>
              <Link
                href="/cv"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1738D1] dark:text-blue-400 hover:underline"
              >
                Susun CV Baru <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {careerDirections.map((dir) => (
                <div
                  key={dir.roleId}
                  className="p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {dir.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {dir.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-[#1738D1] dark:text-blue-400">
                          {dir.fitScore}%
                        </span>
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Kecocokan
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Usaha Transisi:</span>
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-[10px] text-[10px] font-bold border',
                          dir.transitionEffort === 'Rendah'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : dir.transitionEffort === 'Sedang'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        )}
                      >
                        Transisi {dir.transitionEffort}
                      </span>
                    </div>

                    {/* Transferable Skills */}
                    {dir.transferableSkills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Keahlian yang Dapat Ditransfer:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {dir.transferableSkills.map((sk, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Career Stepping Stones Path */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Jalur Jenjang Karier:
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto no-scrollbar">
                        {dir.careerPath.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="px-2 py-1 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-[10.5px] font-medium whitespace-nowrap">
                              {step}
                            </span>
                            {idx < dir.careerPath.length - 1 && (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Jadikan target utama?
                    </span>
                    <button
                      onClick={() => handleRoleChange(dir.roleId)}
                      disabled={isUpdatingRole}
                      className="px-3 py-1.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      Analisis Role Ini <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Tentukan Target Posisi Baru */}
      {isCustomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-role-modal-title"
        >
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 id="custom-role-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Tentukan Target Posisi Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-[8px]"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ketik nama posisi pekerjaan yang ingin Anda tuju. Sistem akan menganalisis kesesuaian dokumen dan profil Anda terhadap standar kompetensi posisi tersebut.
            </p>
            <form onSubmit={handleCustomRoleSubmit} className="space-y-4">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="Contoh: Staff Logistik, Akuntan, Graphic Designer..."
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!customRoleInput.trim() || isUpdatingRole}
                  className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#1738D1]/20 transition cursor-pointer"
                >
                  {isUpdatingRole ? 'Memproses...' : 'Simpan & Analisis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
