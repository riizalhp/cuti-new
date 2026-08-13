'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cvApi } from '@/lib/api';
import { FileText, Award, Sliders, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface CVATSScoreCardProps {
  onOptimizeClick?: () => void;
  onSendApplyClick?: () => void;
}

export const CVATSScoreCard: React.FC<CVATSScoreCardProps> = ({
  onOptimizeClick,
  onSendApplyClick,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [atsScore, setAtsScore] = useState(86);
  const [cvTitle, setCvTitle] = useState('CV_Utama.pdf');

  useEffect(() => {
    cvApi.getAll().then((cvs) => {
      if (Array.isArray(cvs) && cvs.length > 0) {
        const primary = cvs.find((c: any) => c.isPrimary) || cvs[0];
        if (primary) {
          if (primary.atsScore) setAtsScore(primary.atsScore);
          if (primary.title) setCvTitle(primary.title);
        }
      }
    });
  }, []);

  const components = [
    { name: 'Kata Kunci (Keywords)', score: 90, status: 'Sangat Baik' },
    { name: 'Pengalaman Kerja', score: 85, status: 'Baik' },
    { name: 'Format & Layout ATS', score: 95, status: 'Sempurna' },
    { name: 'Kelengkapan Data', score: 78, status: 'Perlu Revisi' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full transition-all space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                CV ATS Score
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none">
                {cvTitle}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {atsScore}/100
            </span>
          </div>
        </div>

        {/* Score Summary Badge Box */}
        <div className="flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 my-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Status ATS: Terbaca 92% Akurat
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            Sangat Baik
          </span>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between text-xs my-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            2 rekomendasi optimasi tersedia
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
            {components.map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {c.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {c.score}% ({c.status})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      c.score >= 90
                        ? 'bg-emerald-500'
                        : c.score >= 80
                        ? 'bg-violet-500'
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
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition cursor-pointer border-0"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Optimalkan CV Sekarang</span>
      </button>
    </div>
  );
};
