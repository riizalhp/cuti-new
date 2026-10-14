'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Check,
  Briefcase,
  Clock,
  Plus,
  Search,
  Award,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CvScopeItem {
  id: string;
  title?: string;
  name?: string;
  target_position?: string;
  targetPosition?: string;
  headline?: string;
  targetRole?: string;
  fullName?: string;
  atsScore?: number;
  skills?: any[];
  skillsList?: any[];
  updatedAt?: string;
  updated_at?: string;
  created_at?: string;
  isPrimary?: boolean;
  is_primary?: boolean;
  data?: any;
  [key: string]: any;
}

export interface CvScopeSelectorProps {
  cvs: CvScopeItem[];
  selectedCvId: string;
  onChange: (cvId: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  label?: string;
  className?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function extractCvDetails(cv: CvScopeItem) {
  const displayTitle = cv.title || cv.name || cv.target_position || cv.targetPosition || 'CV Saya';
  const displayRole =
    cv.target_position ||
    cv.targetPosition ||
    cv.headline ||
    cv.targetRole ||
    (Array.isArray(cv.data?.targetPositions) ? cv.data.targetPositions[0] : '') ||
    'Posisi belum ditentukan';

  let skillsArr: string[] = [];
  if (Array.isArray(cv.skills)) {
    skillsArr = cv.skills.map((s) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean);
  } else if (Array.isArray(cv.skillsList)) {
    skillsArr = cv.skillsList.map((s) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean);
  } else if (Array.isArray(cv.data?.skills)) {
    skillsArr = cv.data.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean);
  }

  const displayAts = cv.atsScore || cv.data?.atsScore || 0;
  const displayDate = cv.updatedAt || cv.updated_at || cv.created_at || 'Baru dibuat';

  return {
    displayTitle,
    displayRole,
    displaySkills: skillsArr.slice(0, 4),
    displayAts,
    displayDate,
  };
}

export const CvScopeSelector: React.FC<CvScopeSelectorProps> = ({
  cvs,
  selectedCvId,
  onChange,
  allowAll = true,
  allLabel = 'Semua CV (Skor Tertinggi)',
  label = 'Basis CV',
  className = '',
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDrawerOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setDrawerOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const [searchQuery, setSearchQuery] = useState('');

  // Tentukan label tombol pemicu saat ini
  const activeLabel = useMemo(() => {
    if (selectedCvId === 'all') {
      return allLabel;
    }
    const current = cvs.find((c) => c.id === selectedCvId);
    if (!current) return allLabel;
    const details = extractCvDetails(current);
    return details.displayRole !== 'Posisi belum ditentukan'
      ? `${details.displayTitle} (${details.displayRole})`
      : details.displayTitle;
  }, [cvs, selectedCvId, allLabel]);

  // Filter CV berdasarkan pencarian di dalam drawer
  const filteredCvs = useMemo(() => {
    if (!searchQuery.trim()) return cvs;
    const q = searchQuery.toLowerCase().trim();
    return cvs.filter((cv) => {
      const { displayTitle, displayRole, displaySkills } = extractCvDetails(cv);
      return (
        displayTitle.toLowerCase().includes(q) ||
        displayRole.toLowerCase().includes(q) ||
        displaySkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [cvs, searchQuery]);

  const isAllOptionMatch = useMemo(() => {
    if (!allowAll) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return 'semua cv'.includes(q) || 'terbaik'.includes(q) || 'holistik'.includes(q);
  }, [allowAll, searchQuery]);

  // Kondisi: Belum ada CV sama sekali di akun pengguna
  if (!cvs || cvs.length === 0) {
    if (trigger) {
      return <>{trigger}</>;
    }
    return (
      <Link
        href="/cv"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold text-cobalt-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition cursor-pointer',
          className
        )}
        title="Buat dokumen CV pertamamu"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Buat CV</span>
      </Link>
    );
  }

  const handleSelect = (id: string) => {
    onChange(id);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Trigger: Kustom Trigger bila disediakan, atau Modern Context Chip baku */}
      {trigger ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setDrawerOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDrawerOpen(true);
            }
          }}
          className={cn('inline-flex cursor-pointer', className)}
        >
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-100 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500',
            className
          )}
          title="Klik untuk memilih atau mengganti basis CV"
        >
          <FileText className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">{label}:</span>
          <span className="truncate max-w-[150px] sm:max-w-[200px] text-slate-900 dark:text-white">
            {activeLabel}
          </span>
        </button>
      )}

      {/* Right-Hand Slide-in Drawer Sesuai Standar Design System Employr */}
      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
          {/* Header Drawer */}
          <SheetHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <SheetTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cobalt-500 dark:text-blue-400" />
              <span>Pilih CV</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tentukan acuan untuk kalkulasi kecocokan.
            </SheetDescription>
          </SheetHeader>

          {/* Search Bar Input */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari CV berdasarkan nama, posisi, atau keahlian..."
                className="w-full pl-9 pr-8 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body: Daftar Card CV Visual Parity dengan Halaman /cv */}
          <SheetBody className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
            {/* Opsi 1: Card Spesial "Semua CV (Terbaik)" */}
            {isAllOptionMatch && (
              <div
                onClick={() => handleSelect('all')}
                className={cn(
                  'p-4 rounded-[10px] border transition cursor-pointer flex flex-col justify-between gap-2.5 relative overflow-hidden group',
                  selectedCvId === 'all'
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-cobalt-500 shadow-sm ring-1 ring-cobalt-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-[10px] bg-blue-100 dark:bg-blue-900/60 text-cobalt-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{allLabel}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-blue-100 dark:bg-blue-900/60 text-cobalt-700 dark:text-blue-300">
                          Rekomendasi
                        </span>
                      </h4>
                      <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Mengevaluasi setiap loker ke seluruh ({cvs.length}) CV kamu, lalu mengambil skor kecocokan tertinggi.
                      </p>
                    </div>
                  </div>

                  {selectedCvId === 'all' ? (
                    <span className="px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold bg-cobalt-500 text-white flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  ) : (
                    <span className="text-caption text-slate-400 group-hover:text-cobalt-600 font-bold transition">
                      Pilih
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Opsi 2..N: Daftar Card Dokumen CV Spesifik */}
            {filteredCvs.map((cv) => {
              const isSelected = selectedCvId === cv.id;
              const { displayTitle, displayRole, displaySkills, displayAts, displayDate } =
                extractCvDetails(cv);

              return (
                <div
                  key={cv.id}
                  onClick={() => handleSelect(cv.id)}
                  className={cn(
                    'p-4 rounded-[10px] border transition cursor-pointer flex flex-col justify-between gap-3 group relative',
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-cobalt-500 shadow-sm ring-1 ring-cobalt-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  )}
                >
                  {/* Card Top: Ikon, Judul, Tanggal, dan Skor ATS */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-cobalt-600 dark:group-hover:text-blue-400 transition">
                          {displayTitle}
                        </h4>
                        <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Diperbarui: {displayDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {displayAts > 0 && (
                        <span className="px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>ATS {displayAts}%</span>
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-[8px] text-[10px] font-extrabold bg-cobalt-500 text-white flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Target Posisi */}
                  <div className="py-2 px-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold truncate">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{displayRole}</span>
                    </div>
                  </div>

                  {/* Daftar Keahlian Utama (Top Skills) */}
                  {displaySkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      {displaySkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[6px] text-caption font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tombol Aksi Gunakan */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                    {isSelected ? (
                      <span className="text-xs font-bold text-cobalt-600 dark:text-blue-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Sedang Digunakan</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-cobalt-600 dark:group-hover:text-blue-400 transition">
                        Gunakan CV Ini →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredCvs.length === 0 && !isAllOptionMatch && (
              <div className="text-center py-8 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Tidak ada CV yang cocok dengan pencarian &quot;{searchQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-cobalt-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </SheetBody>

          {/* Footer Drawer */}
          <SheetFooter className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between gap-3">
            <Link
              href="/cv"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kelola CV di CV Builder</span>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(false)}
            >
              Tutup
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
