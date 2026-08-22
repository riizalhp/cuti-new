'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  Gift,
  Award,
  Zap,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { userApi } from '@/lib/api';

export const ReferralView: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [totalBonus, setTotalBonus] = useState('Belum ada bonus');
  const [invitedFriends, setInvitedFriends] = useState<
    Array<{ name: string; date: string; status: string; reward: string }>
  >([]);

  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        const firstName = (profile.fullName || profile.name || 'USER').split(' ')[0].toUpperCase();
        const code = profile.referralCode || `EMPLOYR-${firstName}${new Date().getFullYear()}`;
        setReferralCode(code);
        setReferralLink(profile.referralLink || `https://employr.id/ref/${code}`);

        // Load referral data from database
        if (profile.referralStats) {
          setTotalBonus(profile.referralStats.totalBonus || 'Belum ada bonus');
          setInvitedFriends(profile.referralStats.invitedFriends || []);
        }
      }
    }).catch(() => {
      setReferralCode('EMPLOYR-USER2026');
      setReferralLink('https://employr.id/ref/EMPLOYR-USER2026');
    });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Standardized */}
      <PageHeader
        title="Program Undag Teman & Referral"
        subtitle="Ajak teman pencari kerja bergabung! Dapatkan akses Premium Gratis + Saldo Koin Karier untuk setiap teman yang mendaftar."
        icon={Users}
        badge="Referral"
        stats={[
          {
            label: 'Total Bonus Kamu',
            value: totalBonus,
            icon: Award,
            colorClass: 'text-amber-500',
          },
          {
            label: 'Teman Diundang',
            value: invitedFriends.length,
            icon: Users,
            colorClass: 'text-indigo-600 dark:text-indigo-400',
          },
        ]}
      />

      {/* Referral Code & Share Link Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kode Referral */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Kode Referral Unik Kamu
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono font-black text-lg text-orange-600 dark:text-orange-400 tracking-wider">
              {referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-3 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              {isCodeCopied ? <CheckCircle2 className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
              <span>{isCodeCopied ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Teman kamu akan mendapatkan <strong className="text-slate-800 dark:text-slate-200">Diskon 50% Premium Pass</strong> saat memasukkan kode ini.
          </p>
        </div>

        {/* Link Undangan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Link Bagikan Langsung
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 p-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-[10px] bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0"
            >
              {isLinkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{isLinkCopied ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Bagikan link ini langsung ke grup WhatsApp alumni, LinkedIn, atau Telegram kamu.
          </p>
        </div>
      </div>

      {/* How It Works - 3 Step Guide */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Cara Kerja Program Referral (3 Langkah)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Bagikan Kode Unik</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kirim kode atau link referral kamu ke teman pencari kerja.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Teman Daftar & Pakai</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Teman mendaftar akun dan menyelesaikan onboarding pembuatan CV pertama.
            </p>
          </div>

          <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Dapatkan Hadiah</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kamu otomatis mendapatkan +14 Hari Pass Premium & Saldo Koin per teman.
            </p>
          </div>
        </div>
      </div>

      {/* Invited Friends List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            Daftar Teman yang Bergabung ({invitedFriends.length})
          </h3>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-[10px] border border-emerald-200 dark:border-emerald-800/40">
            Status Rewards Aktif
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {invitedFriends.length > 0 ? invitedFriends.map((friend, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center">
                  {friend.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{friend.name}</h4>
                  <p className="text-[11px] text-slate-400">Bergabung: {friend.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {friend.status}
                </span>
                <span className="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                  {friend.reward}
                </span>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Belum ada teman yang bergabung</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Bagikan kode referral kamu untuk mulai mengundang teman</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
