import React from 'react';
import {
  Globe,
  LayoutDashboard,
  Briefcase,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Search,
  Instagram,
  Share2,
  Compass,
  MessageCircle,
  Video,
  Send,
} from 'lucide-react';

export interface DomainMeta {
  label: string;
  sublabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: React.ReactNode;
}

export function getDomainInfo(domain?: string | null): DomainMeta {
  const d = (domain || '').toLowerCase();

  if (d.includes('app.employr.id') || d.includes('3000')) {
    return {
      label: 'Dashboard User',
      sublabel: 'app.employr.id',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeText: 'text-blue-700 dark:text-blue-300',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      icon: <LayoutDashboard size={12} className="text-blue-500" />,
    };
  }

  if (d.includes('loker.employr.id') || d.includes('3003')) {
    return {
      label: 'Portal Loker',
      sublabel: 'loker.employr.id',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      icon: <Briefcase size={12} className="text-emerald-500" />,
    };
  }

  if (d.includes('learning.employr.id') || d.includes('3004')) {
    return {
      label: 'Learning',
      sublabel: 'learning.employr.id',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
      badgeText: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-200 dark:border-purple-800',
      icon: <BookOpen size={12} className="text-purple-500" />,
    };
  }

  if (d.includes('faq.employr.id') || d.includes('3005')) {
    return {
      label: 'FAQ / Bantuan',
      sublabel: 'faq.employr.id',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
      badgeText: 'text-teal-700 dark:text-teal-300',
      badgeBorder: 'border-teal-200 dark:border-teal-800',
      icon: <HelpCircle size={12} className="text-teal-500" />,
    };
  }

  if (d.includes('masterdata.employr.id') || d.includes('admin') || d.includes('3002')) {
    return {
      label: 'Admin Panel',
      sublabel: 'masterdata.employr.id',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      icon: <ShieldAlert size={12} className="text-rose-500" />,
    };
  }

  // Default: Landing Page / employr.id
  return {
    label: 'Landing Page',
    sublabel: 'employr.id',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
    icon: <Globe size={12} className="text-orange-500" />,
  };
}

export interface TrafficSourceMeta {
  label: string;
  category: 'social' | 'search' | 'campaign' | 'direct' | 'referral';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: React.ReactNode;
}

export function getTrafficSourceInfo(source?: string | null): TrafficSourceMeta {
  const s = (source || 'Direct').trim();
  const lower = s.toLowerCase();

  if (lower.includes('google')) {
    return {
      label: s,
      category: 'search',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/50',
      badgeText: 'text-blue-700 dark:text-blue-300',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      icon: <Search size={12} className="text-blue-500" />,
    };
  }

  if (lower.includes('instagram')) {
    return {
      label: 'Instagram',
      category: 'social',
      badgeBg: 'bg-pink-50 dark:bg-pink-950/50',
      badgeText: 'text-pink-700 dark:text-pink-300',
      badgeBorder: 'border-pink-200 dark:border-pink-800',
      icon: <Instagram size={12} className="text-pink-500" />,
    };
  }

  if (lower.includes('tiktok')) {
    return {
      label: 'TikTok',
      category: 'social',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-800 dark:text-slate-200',
      badgeBorder: 'border-slate-300 dark:border-slate-700',
      icon: <Share2 size={12} className="text-slate-700 dark:text-slate-300" />,
    };
  }

  if (lower.includes('linkedin')) {
    return {
      label: 'LinkedIn',
      category: 'social',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      icon: <Share2 size={12} className="text-sky-600" />,
    };
  }

  if (lower.includes('whatsapp')) {
    return {
      label: 'WhatsApp',
      category: 'social',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      icon: <MessageCircle size={12} className="text-emerald-600" />,
    };
  }

  if (lower.includes('youtube')) {
    return {
      label: 'YouTube',
      category: 'social',
      badgeBg: 'bg-red-50 dark:bg-red-950/50',
      badgeText: 'text-red-700 dark:text-red-300',
      badgeBorder: 'border-red-200 dark:border-red-800',
      icon: <Video size={12} className="text-red-600" />,
    };
  }

  if (lower.includes('telegram')) {
    return {
      label: 'Telegram',
      category: 'social',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/50',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      icon: <Send size={12} className="text-sky-500" />,
    };
  }

  if (lower.includes('campaign')) {
    return {
      label: s,
      category: 'campaign',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      icon: <Compass size={12} className="text-amber-600" />,
    };
  }

  if (lower.includes('internal')) {
    return {
      label: 'Internal Navigation',
      category: 'direct',
      badgeBg: 'bg-slate-50 dark:bg-slate-800/60',
      badgeText: 'text-slate-600 dark:text-slate-400',
      badgeBorder: 'border-slate-200 dark:border-slate-700',
      icon: <Compass size={12} className="text-slate-400" />,
    };
  }

  if (lower.includes('referral')) {
    return {
      label: s,
      category: 'referral',
      badgeBg: 'bg-violet-50 dark:bg-violet-950/50',
      badgeText: 'text-violet-700 dark:text-violet-300',
      badgeBorder: 'border-violet-200 dark:border-violet-800',
      icon: <Globe size={12} className="text-violet-500" />,
    };
  }

  return {
    label: 'Direct',
    category: 'direct',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    icon: <Globe size={12} className="text-slate-500" />,
  };
}
