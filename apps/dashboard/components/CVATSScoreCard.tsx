'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cvApi } from '@/lib/api';
import { FileText, Sliders, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Plus } from 'lucide-react';
import { calculateAtsScore, getAtsStatusLabel } from '@/lib/ats-score';

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
  const [accuracyRate, setAccuracyRate] = useState<number>(0);
  const [recommendationsCount, setRecommendationsCount] = useState<number>(0);
  const [hasCv, setHasCv] = useState<boolean>(true);
  const [breakdown, setBreakdown] = useState([
    { name: 'Kata Kunci (Keywords)', score: 0, status: 'Memuat...' },
    { name: 'Pengalaman Kerja', score: 0, status: 'Memuat...' },
    { name: 'Format & Layout ATS', score: 95, status: 'Sempurna' },
    { name: 'Kelengkapan Data', score: 0, status: 'Memuat...' },
  ]);

  const applyCvData = (cv: any) => {
    if (!cv) {
      setHasCv(false);
      setAtsScore(0);
      setCvTitle('Belum ada dokumen CV');
      return;
    }

    setHasCv(true);
    setCvTitle(cv.title || 'CV ATS - Modern Standard');

    const metrics = calculateAtsScore(cv);
    setAtsScore(metrics.totalScore);
    setAccuracyRate(metrics.accuracyRate);
    setRecommendationsCount(metrics.recommendationsCount);

    const getStatusText = (val: number) => {
      if (val >= 90) return 'Sangat Baik';
      if (val >= 80) return 'Baik';
      if (val >= 70) return 'Cukup';
      return 'Perlu Revisi';
    };

    setBreakdown([
      { name: 'Kata Kunci (Keywords)', score: metrics.keywordScore, status: getStatusText(metrics.keywordScore) },
      { name: 'Pengalaman Kerja', score: metrics.expScore, status: getStatusText(metrics.expScore) },
      { name: 'Format & Layout ATS', score: metrics.formatScore, status: 'Sempurna' },
      { name: 'Kelengkapan Data', score: metrics.completenessScore, status: getStatusText(metrics.completenessScore) },
    ]);
  };

  useEffect(() => {
    // Sumber utama: database. Draf localStorage lama sengaja TIDAK dipakai sebagai
    // data CV, agar tidak muncul "CV hantu" dari sesi/browser sebelumnya.
    cvApi.getAll().then((cvs) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        // Handle multiple CVs
        if (cvs.length === 1) {
          // Single CV: show as-is
          const cv = cvs[0];
          applyCvData(cv);
        } else {
          // Multiple CVs: calculate average
          const totalScore = cvs.reduce((sum: number, cv: any) => {
            const metrics = calculateAtsScore(cv);
            return sum + metrics.totalScore;
          }, 0);
          const avgScore = Math.round(totalScore / cvs.length);

          setHasCv(true);
          setCvTitle(`${cvs.length} CV - Rata-rata ATS Score`);
          setAtsScore(avgScore);

          // Calculate average breakdown
          const avgKeyword = Math.round(cvs.reduce((sum: number, cv: any) => sum + calculateAtsScore(cv).keywordScore, 0) / cvs.length);
          const avgExp = Math.round(cvs.reduce((sum: number, cv: any) => sum + calculateAtsScore(cv).expScore, 0) / cvs.length);
          const avgFormat = Math.round(cvs.reduce((sum: number, cv: any) => sum + calculateAtsScore(cv).formatScore, 0) / cvs.length);
          const avgCompleteness = Math.round(cvs.reduce((sum: number, cv: any) => sum + calculateAtsScore(cv).completenessScore, 0) / cvs.length);

          const getStatusText = (val: number) => {
            if (val >= 90) return 'Sangat Baik';
            if (val >= 80) return 'Baik';
            if (val >= 70) return 'Cukup';
            return 'Perlu Revisi';
          };

          setBreakdown([
            { name: 'Kata Kunci (Keywords)', score: avgKeyword, status: getStatusText(avgKeyword) },
            { name: 'Pengalaman Kerja', score: avgExp, status: getStatusText(avgExp) },
            { name: 'Format & Layout ATS', score: avgFormat, status: 'Sempurna' },
            { name: 'Kelengkapan Data', score: avgCompleteness, status: getStatusText(avgCompleteness) },
          ]);

          const avgAccuracy = Math.min(99, Math.max(70, Math.round(avgScore * 1.05)));
          const avgRecommendations = Math.max(1, 4 - Math.floor(avgScore / 25));
          setAccuracyRate(avgAccuracy);
          setRecommendationsCount(avgRecommendations);
        }
      } else {
        setHasCv(false);
        setAtsScore(0);
        setCvTitle('Belum ada dokumen CV');
        setAccuracyRate(0);
        setRecommendationsCount(0);
        setBreakdown([
          { name: 'Kata Kunci (Keywords)', score: 0, status: 'Belum ada data' },
          { name: 'Pengalaman Kerja', score: 0, status: 'Belum ada data' },
          { name: 'Format & Layout ATS', score: 0, status: 'Belum ada data' },
          { name: 'Kelengkapan Data', score: 0, status: 'Belum ada data' },
        ]);
      }
    });
  }, []);

  const displayScore = atsScore !== null ? atsScore : 0;
  const statusLabel = getAtsStatusLabel(displayScore);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full transition-all space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                CV ATS Score
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none font-medium">
                {cvTitle}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {atsScore !== null ? `${displayScore}/100` : '...'}
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box */}
        <div className="flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-[10px] border border-emerald-100 dark:border-emerald-900/40 my-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Status ATS: Terbaca {accuracyRate}% Akurat
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${
            displayScore >= 85
              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950'
              : displayScore >= 70
              ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950'
              : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950'
          }`}>
            {statusLabel}
          </span>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            {!hasCv
              ? 'Buat CV untuk melihat skor ATS kamu'
              : recommendationsCount > 0
              ? `${recommendationsCount} rekomendasi optimasi tersedia`
              : 'Format CV optimal & siap screening HR'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Breakdown Section */}
        {isExpanded && (
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
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
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      c.score >= 90
                        ? 'bg-emerald-500'
                        : c.score >= 80
                        ? 'bg-[#1738D1]'
                        : 'bg-amber-500'
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
      <button
        onClick={onOptimizeClick || (() => router.push('/cv'))}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition cursor-pointer border-0"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Optimalkan CV Sekarang</span>
      </button>
    </div>
  );
};
