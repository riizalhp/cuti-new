'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Coins,
  Gift,
  Sparkles,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { userApi } from '@/lib/api';

export const ReferralProgramCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [commission, setCommission] = useState('Rp 0');
  const [invitedCount, setInvitedCount] = useState(0);
  const [recentInvitedFriends, setRecentInvitedFriends] = useState<
    Array<{ name: string; role: string; bonus: string; status: string }>
  >([]);

  useEffect(() => {
    userApi.getProfile().then((profile: any) => {
      if (profile) {
        // Generate referral code from user's name
        const firstName = (profile.fullName || profile.name || 'USER').split(' ')[0].toUpperCase();
        setReferralCode(`${firstName}-CUTI2026`);

        // Load referral stats if available from profile
        if (profile.referralStats) {
          setCommission(profile.referralStats.totalCommission || 'Rp 0');
          setInvitedCount(profile.referralStats.invitedCount || 0);
          setRecentInvitedFriends(profile.referralStats.recentFriends || []);
        }
      }
    }).catch(() => {
      setReferralCode('USER-CUTI2026');
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    setClaimed(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between h-full space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Program Referral Karir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Undang rekan &amp; dapatkan bonus cash out
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
            {invitedCount} Teman Bergabung
          </span>
        </div>

        {/* Code Box */}
        <div className="bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-[10px] border border-orange-100 dark:border-orange-900/40">
          <p className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Kode Referral Unik Anda:</span>
            <span className="text-orange-500 font-medium">Bonus Rp 50rb / teman</span>
          </p>
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded-[10px] border border-orange-200 dark:border-orange-800">
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-semibold transition cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Commission stats */}
        <div className="flex items-center justify-between p-3 rounded-[10px] bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
              <span>Total Komisi Terkumpul</span>
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {commission}
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Tier Gold Ambassador Progress */}
        <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Target Ambassador Tier:</span>
              <span className="text-amber-500 font-extrabold">{invitedCount >= 10 ? 'Gold' : invitedCount >= 5 ? 'Silver' : 'Bronze'} ({invitedCount}/10)</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">+Rp 100rb Bonus</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (invitedCount / 10) * 100)}%` }}></div>
          </div>
        </div>

        {/* Recent Invited Friends List */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Teman Terbaru Yang Menggunakan Kode:
          </p>
          <div className="space-y-1.5">
            {recentInvitedFriends.length > 0 ? recentInvitedFriends.map((friend, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{friend.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{friend.role}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">{friend.bonus}</span>
                  <span className="text-[9px] text-slate-400">{friend.status}</span>
                </div>
              </div>
            )) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-3">
                Belum ada teman yang menggunakan kode referral kamu
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] font-bold text-xs transition shadow-sm cursor-pointer ${
          claimed
            ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
            : 'bg-[#1738D1] hover:bg-[#132EA8] text-white'
        }`}
      >
        <Gift className="w-4 h-4" />
        <span>{claimed ? 'Pencairan Diproses ke Rekening' : 'Cairkan Bonus Ke Rekening / E-Wallet'}</span>
      </button>
    </div>
  );
};

