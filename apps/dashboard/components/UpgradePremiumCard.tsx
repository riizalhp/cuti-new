'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Bot,
  Briefcase,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface UpgradePremiumCardProps {
  onUpgradeClick: () => void;
}

export const UpgradePremiumCard: React.FC<UpgradePremiumCardProps> = ({
  onUpgradeClick,
}) => {
  const benefits = [
    { text: 'Ranking lamaran lebih tinggi di HR Portal', icon: Zap },
    { text: 'AI Assistant Karir 24/7 (Unlimited)', icon: Bot },
    { text: 'Rekomendasi kerja eksklusif perusahaan BUMN & Startup', icon: Briefcase },
    { text: 'Optimasi CV ATS & Cover Letter Otomatis', icon: Sliders },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl p-5 text-white shadow-md border border-amber-400/40 flex flex-col justify-between transition-transform hover:scale-[1.01]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/20 text-amber-100 backdrop-blur-sm border border-amber-300/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-200" />
            Special Pass Offer
          </span>
          <span className="text-xs font-bold text-amber-100 bg-amber-800/40 px-2 py-0.5 rounded-md">
            Diskon 50%
          </span>
        </div>

        <h3 className="text-base font-extrabold text-white mb-1">
          Upgrade Ke Paket Premium
        </h3>
        <p className="text-xs text-amber-100/90 leading-snug mb-4">
          Buka akses lengkap seluruh alat AI &amp; prioritas lamaran kerja kamu.
        </p>

        <div className="space-y-2 mb-5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Icon className="w-4 h-4 text-amber-200 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-amber-50">{b.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onUpgradeClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs shadow-lg transition border border-amber-400/30"
      >
        <span>Upgrade Sekarang</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
