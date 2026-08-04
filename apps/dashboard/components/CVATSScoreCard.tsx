'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  Sparkles,
  Send,
  Sliders,
  Award,
} from 'lucide-react';

interface CVATSScoreCardProps {
  onOptimizeClick: () => void;
  onSendApplyClick: () => void;
}

export const CVATSScoreCard: React.FC<CVATSScoreCardProps> = ({
  onOptimizeClick,
  onSendApplyClick,
}) => {
  const atsScore = 86;

  const components = [
    { name: 'Kata Kunci (Keywords)', score: 90, status: 'Sangat Baik' },
    { name: 'Pengalaman Kerja', score: 85, status: 'Baik' },
    { name: 'Format & Layout ATS', score: 95, status: 'Sempurna' },
    { name: 'Kelengkapan Data', score: 78, status: 'Perlu Revisi' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                CV Saya (ATS Score)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dokumen: <span className="font-semibold text-slate-700 dark:text-slate-300">CV_Andi_Pratama_2026.pdf</span>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Sangat Baik
          </span>
        </div>

        {/* ATS Score Display */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {atsScore}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Status Skor ATS: Sangat Baik
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
              CV Anda dapat terbaca sistem ATS perusahaan besar dengan akurasi 92%.
            </p>
          </div>
        </div>

        {/* Breakdown Components */}
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Komponen Penilaian:
          </p>
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
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onSendApplyClick}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Siap Kirim Lamaran</span>
        </button>
        <button
          onClick={onOptimizeClick}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-violet-50 dark:bg-violet-950/80 hover:bg-violet-100 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200 dark:border-violet-800 transition"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Optimalkan CV</span>
        </button>
      </div>
    </div>
  );
};
