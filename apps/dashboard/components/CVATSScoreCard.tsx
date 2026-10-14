'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cvApi } from '@/lib/api';
import {
  FileTextIcon,
  SlidersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
} from '@/components/icons/CustomIcons';
import { calculateAtsScore, getAtsStatusLabel, getScoreColorTokens } from '@/lib/ats-score';
import { calculateDynamicAtsScore } from '@/lib/ats-score-engine';

interface CVATSScoreCardProps {
  onOptimizeClick?: () => void;
  onSendApplyClick?: () => void;
}

export const CVATSScoreCard: React.FC<CVATSScoreCardProps> = ({
  onOptimizeClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [cvTitle, setCvTitle] = useState<string>('Memuat data CV...');
  const [recommendationsCount, setRecommendationsCount] = useState<number>(0);
  const [hasCv, setHasCv] = useState<boolean>(true);
  const [isEmptyOrDefault, setIsEmptyOrDefault] = useState<boolean>(false);
  const [totalCvsCount, setTotalCvsCount] = useState<number>(0);
  const [emptyDraftsCount, setEmptyDraftsCount] = useState<number>(0);
  const [isPrimarySelected, setIsPrimarySelected] = useState<boolean>(false);
  const [penalties, setPenalties] = useState<string[]>([]);
  const [bonuses, setBonuses] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState([
    { name: 'Content Quality (40%)', score: 0, status: 'Memuat...' },
    { name: 'ATS Readability (25%)', score: 0, status: 'Memuat...' },
    { name: 'Completeness (20%)', score: 0, status: 'Memuat...' },
    { name: 'Content Integrity (15%)', score: 0, status: 'Memuat...' },
  ]);

  const applyCvData = (cv: any, totalCount = 1, emptyCount = 0) => {
    if (!cv) {
      setHasCv(false);
      setAtsScore(0);
      setCvTitle('Belum ada dokumen CV');
      return;
    }

    setHasCv(true);
    setIsPrimarySelected(Boolean(cv.isPrimary));
    const titleLabel = cv.title || 'CV ATS Modern';
    if (totalCount > 1) {
      setCvTitle(cv.isPrimary ? `${titleLabel} (CV Utama)` : `${titleLabel} (Default)`);
    } else {
      setCvTitle(titleLabel);
    }

    const dyn = calculateDynamicAtsScore(cv);
    const resolvedScore = dyn.totalScore > 0 ? dyn.totalScore : (cv.atsScore && cv.atsScore > 0 ? cv.atsScore : 0);
    setAtsScore(resolvedScore);
    setRecommendationsCount(dyn.issues.length);
    setIsEmptyOrDefault(resolvedScore === 0 ? true : dyn.isEmptyOrDefault);
    setPenalties(dyn.issues.map((i) => i.message));
    setBonuses([
      `Content Quality: ${dyn.engines.contentQuality.score}%`,
      `ATS Readability: ${dyn.engines.atsReadability.score}%`,
      `Completeness: ${dyn.engines.completeness.score}%`,
      `Content Integrity: ${dyn.engines.contentIntegrity.score}%`,
    ]);

    const getStatusText = (val: number) => {
      if (val >= 90) return 'Sangat Baik';
      if (val >= 75) return 'Baik';
      if (val >= 60) return 'Cukup';
      return 'Perlu Revisi';
    };

    setBreakdown([
      { name: 'Content Quality (40%)', score: dyn.engines.contentQuality.score, status: getStatusText(dyn.engines.contentQuality.score) },
      { name: 'ATS Readability (25%)', score: dyn.engines.atsReadability.score, status: getStatusText(dyn.engines.atsReadability.score) },
      { name: 'Completeness (20%)', score: dyn.engines.completeness.score, status: getStatusText(dyn.engines.completeness.score) },
      { name: 'Content Integrity (15%)', score: dyn.engines.contentIntegrity.score, status: getStatusText(dyn.engines.contentIntegrity.score) },
    ]);
  };

  useEffect(() => {
    cvApi.getAll().then((cvs) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        // Fokus evaluasi pada CV Utama (Primary CV)
        const primaryCv = cvs.find((c: any) => c.isPrimary) || cvs[0];
        const emptyCount = cvs.filter((c: any) => {
          const dyn = calculateDynamicAtsScore(c);
          return dyn.isEmptyOrDefault || dyn.totalScore === 0 || !c.atsScore || c.atsScore === 0;
        }).length;

        setTotalCvsCount(cvs.length);
        setEmptyDraftsCount(emptyCount);
        applyCvData(primaryCv, cvs.length, emptyCount);
      } else {
        setHasCv(false);
        setAtsScore(0);
        setCvTitle('Belum ada dokumen CV');
        setRecommendationsCount(0);
        setIsEmptyOrDefault(true);
        setTotalCvsCount(0);
        setEmptyDraftsCount(0);
        setPenalties([]);
        setBonuses([]);
        setBreakdown([
          { name: 'Content Quality (40%)', score: 0, status: 'Belum ada data' },
          { name: 'ATS Readability (25%)', score: 0, status: 'Belum ada data' },
          { name: 'Completeness (20%)', score: 0, status: 'Belum ada data' },
          { name: 'Content Integrity (15%)', score: 0, status: 'Belum ada data' },
        ]);
      }
    });
  }, []);

  const displayScore = atsScore !== null ? atsScore : 0;
  const statusLabel = getAtsStatusLabel(displayScore, isEmptyOrDefault);
  const scoreTokens = getScoreColorTokens(hasCv ? displayScore : 0, isEmptyOrDefault || !hasCv);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full transition-all space-y-3">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${scoreTokens.iconWrapper}`}>
              <FileTextIcon size={14} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                CV ATS Score
              </h3>
              <p className="text-caption text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none font-medium">
                {cvTitle}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className={`text-lg font-black font-mono transition-colors ${scoreTokens.text}`}>
              {atsScore !== null ? `${displayScore}/100` : '...'}
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box */}
        <div className={`flex items-center justify-between p-2 sm:p-2.5 rounded-[8px] border my-2.5 transition-colors ${scoreTokens.bgBox} ${scoreTokens.border}`}>
          <div className="flex items-center gap-2">
            {scoreTokens.tier === 'good' && (
              <CheckCircleIcon size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            )}
            {scoreTokens.tier === 'medium' && (
              <AlertTriangleIcon size={16} className="text-amber-700 dark:text-amber-400 shrink-0" />
            )}
            {scoreTokens.tier === 'low' && (
              <AlertCircleIcon size={16} className="text-rose-700 dark:text-rose-400 shrink-0" />
            )}
            {scoreTokens.tier === 'empty' && (
              <FileTextIcon size={16} className="text-slate-500 dark:text-slate-500 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {!hasCv
                ? 'Status Format: Belum Ada Dokumen'
                : isEmptyOrDefault
                ? 'Status Format: Draf Belum Terisi'
                : atsScore !== null && atsScore >= 80
                ? 'Status Format: Sangat Optimal'
                : atsScore !== null && atsScore >= 60
                ? 'Status Format: Siap Screening'
                : 'Status Format: Perlu Dioptimalkan'}
            </span>
          </div>
          <span className={`text-caption font-bold px-2 py-0.5 rounded-[10px] border transition-colors ${scoreTokens.badge}`}>
            {statusLabel}
          </span>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {!hasCv
              ? 'Buat CV untuk melihat skor ATS kamu'
              : isEmptyOrDefault
              ? totalCvsCount > 1
                ? 'CV Utama masih berupa draf kosong: isi data asli kamu terlebih dahulu'
                : 'CV masih kosong atau template default: isi data asli kamu terlebih dahulu'
              : recommendationsCount > 0
              ? `${recommendationsCount} penalti aktif, ${bonuses.length} bonus didapat`
              : 'Format CV optimal & siap screening HR'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="ats-breakdown-details"
            className={`font-bold hover:underline flex items-center gap-0.5 cursor-pointer transition-colors px-2 py-1 min-h-[30px] hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[6px] ${scoreTokens.text}`}
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
            {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>
        </div>

        {/* Informative Notice for Multiple CVs / Empty Drafts */}
        {totalCvsCount > 1 && (
          <div className="my-2.5 p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2 text-caption leading-relaxed">
            {emptyDraftsCount > 0 ? (
              <AlertTriangleIcon size={14} className="text-amber-700 shrink-0 mt-0.5 dark:text-amber-400" />
            ) : (
              <FileTextIcon size={14} className="text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
            )}
            <div className="text-slate-600 dark:text-slate-300">
              <span>
                Skor dihitung dari <strong>{isPrimarySelected ? 'CV Utama' : 'CV Pertama'}</strong> ({totalCvsCount} CV tersimpan).{' '}
              </span>
              {emptyDraftsCount > 0 && (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Ada {emptyDraftsCount} draf CV yang masih kosong di menu CV Saya.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expandable Breakdown Section */}
        {isExpanded && (
          <div id="ats-breakdown-details" className="space-y-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            {/* Daftar Penalti / Pengurangan Skor */}
            {penalties.length > 0 && (
              <div className="space-y-1 bg-red-50/70 dark:bg-red-950/30 p-2.5 rounded-[10px] border border-red-100 dark:border-red-900/40">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Pengurangan Skor (Penalti):</p>
                <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5 pl-3 list-disc">
                  {penalties.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daftar Bonus / Penambahan Skor */}
            {bonuses.length > 0 && (
              <div className="space-y-1 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-[10px] border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Penambahan Skor (Bonus):</p>
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-0.5 pl-3 list-disc">
                  {bonuses.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {breakdown.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {c.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {c.score}% ({c.status})
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={c.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Skor ${c.name}`}
                  className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      c.score >= 75
                        ? 'bg-emerald-500'
                        : c.score >= 60
                        ? 'bg-amber-500'
                        : c.score > 0
                        ? 'bg-rose-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onOptimizeClick || (() => router.push('/cv'))}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-cobalt-500/20 transition cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cobalt-500 dark:focus-visible:ring-offset-slate-900"
        >
          <SlidersIcon size={14} />
          <span>Optimalkan CV Sekarang</span>
        </button>
      </div>
    </div>
  );
};
