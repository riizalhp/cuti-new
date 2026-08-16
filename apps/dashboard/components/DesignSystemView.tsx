'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type,
  LayoutGrid,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Search,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Copy,
  Check,
  X,
  Sliders,
  FileText,
  Mail,
  Users,
  Award,
  TrendingUp,
  Download,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'colors' | 'typography' | 'components' | 'icons'>('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-[10px] text-xs font-bold bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                DESIGN.md Standard
              </span>
              <span className="px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                v2.4 Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panduan &amp; System Style Desain
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dokumen interaktif aturan antarmuka **CUTI**. Menjamin konsistensi visual, bebas emoji (strict Lucide Icons), penerapan Shadcn UI, serta arsitektur Bento Grid dan Right-Hand Drawers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDemoDrawerOpen(true)}
              className="px-4 py-2.5 rounded-[10px] bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Uji Drawer Kanan</span>
            </button>
            <a
              href="#design-md-doc"
              onClick={() => copyToClipboard('DESIGN.md active rule set', 'Aturan')}
              className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{copiedCode === 'Aturan' ? 'Tersalin!' : 'Aturan DESIGN.md'}</span>
            </a>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Prinsip Utama', icon: ShieldCheck },
            { id: 'colors', label: 'Palet Warna', icon: Palette },
            { id: 'typography', label: 'Tipografi', icon: Type },
            { id: 'components', label: 'Komponen UI & Drawer', icon: Layers },
            { id: 'icons', label: 'Aturan Ikon (Lucide)', icon: LayoutGrid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: CORE PRINCIPLES */}
      {(activeSubTab === 'overview' || activeSubTab === 'icons') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-500" />
              <span>4 Pilar Utama System Desain</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilar 1 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Strict Lucide Icons Only</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tanpa emoticon/emoji kasar. Seluruh visual indicator menggunakan ikon terukur dari <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] text-violet-600 dark:text-violet-400">lucide-react</code>.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bento Grid Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pengelompokan informasi secara modular (`grid-cols-12`). Hirarki jelas dengan *padding* proporsional dan batas border bersih.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Right-Hand Slide-in Drawer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formulir kompleks (seperti Tambah Lamaran) bergeser halus dari kanan layar, bukan pop-up modal biasa di tengah.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shadcn UI &amp; Accessibility</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Komponen bergaya Shadcn UI dengan kontras WCAG AA, dukungan Dark/Light mode mulus, dan responsif seluler.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: COLOR PALETTE */}
      {(activeSubTab === 'overview' || activeSubTab === 'colors') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-500" />
              <span>Palet Warna Sistem</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Tailwind CSS Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Swatch 1: Primary Brand Indigo */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Primary Indigo</span>
                <span className="text-[10px] font-mono bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded">Brand Color</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-violet-600 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#4F46E5</div>
                <div className="h-12 rounded-[10px] bg-violet-500 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#6366F1</div>
                <div className="h-12 rounded-[10px] bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk tombol utama, tab aktif, badge AI, dan elemen penting.</p>
            </div>

            {/* Swatch 2: Success & Offering (Emerald) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Success Emerald</span>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">Status Positive</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-emerald-600 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#059669</div>
                <div className="h-12 rounded-[10px] bg-emerald-500 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#10B981</div>
                <div className="h-12 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk status Offering, komisi referral, dan indikator pencapaian.</p>
            </div>

            {/* Swatch 3: Warning & Interview (Amber) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Warning Amber</span>
                <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">Action Pending</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-amber-600 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#D97706</div>
                <div className="h-12 rounded-[10px] bg-amber-500 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#F59E0B</div>
                <div className="h-12 rounded-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk sesi interview mendatang, deadline pending, dan misi aktif.</p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: TYPOGRAPHY SHOWCASE */}
      {(activeSubTab === 'overview' || activeSubTab === 'typography') && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-violet-500" />
              <span>Hierarki Tipografi &amp; Skala</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Plus Jakarta Sans / Inter</span>
          </div>

          <div className="space-y-4">
            {/* Display H1 */}
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono mb-1">Page Title / Hero Heading (text-2xl / font-extrabold)</p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ringkasan Progres Karir &amp; Lamaran Kerja</h1>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">24px / 1.25</span>
            </div>

            {/* H2 Section */}
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono mb-1">Card Header / Sub-section (text-base / font-bold)</p>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Lamaran Terkirim Bulan Ini</h2>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">16px / 1.4</span>
            </div>

            {/* Body */}
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono mb-1">Body Text (text-sm / font-medium)</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Pantau terus jadwal interview serta status tindak lanjut recruiter dari setiap perusahaan yang Anda lamar.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">14px / 1.5</span>
            </div>

            {/* Monospace Code */}
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono mb-1">Code &amp; Referral Token (font-mono / font-bold)</p>
                <code className="text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wider bg-white dark:bg-slate-900 px-3 py-1 rounded-[10px] border border-slate-200 dark:border-slate-700">
                  KARIER-AI-2026-SUPER
                </code>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">Monospace</span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: INTERACTIVE UI COMPONENTS & DRAWER DEMO */}
      {(activeSubTab === 'overview' || activeSubTab === 'components') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              <span>Komponen UI &amp; Demo Drawer Kanan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Variasi Tombol (Button Styles)
              </h3>

              <div className="flex flex-wrap gap-3 items-center">
                <button className="px-4 py-2.5 rounded-[10px] bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Primary Indigo</span>
                </button>

                <button className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer">
                  Secondary Ghost
                </button>

                <button className="px-3.5 py-2 rounded-[10px] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800/60 transition flex items-center gap-1 cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Success Outline</span>
                </button>

                <button className="px-3.5 py-2 rounded-[10px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200/80 dark:border-rose-800/60 transition flex items-center gap-1 cursor-pointer">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Danger Action</span>
                </button>
              </div>
            </div>

            {/* Badges & Pills */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Badges, Tags &amp; Live Indicators
              </h3>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  AI Recommended
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Offering Received
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Interview Besok
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  ATS Score 92%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Right Drawer Preview Trigger Card */}
          <div className="bg-[#0D3BD9] rounded-[10px] p-6 text-white border border-blue-500/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-base text-white">Spesifikasi Right-Hand Slide-in Drawer</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Sesuai instruksi sistem, seluruh form interaktif kompleks meluncur mulus dari batas kanan layar (`fixed inset-0 justify-end slide-in-from-right`), dilengkapi backdrop kustom dan scroll independen.
              </p>
            </div>

            <button
              onClick={() => setIsDemoDrawerOpen(true)}
              className="px-5 py-3 rounded-[10px] bg-white hover:bg-slate-100 text-violet-900 font-extrabold text-xs shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-violet-600" />
              <span>Uji Coba Drawer Kanan</span>
            </button>
          </div>
        </section>
      )}

      {/* DEMO SIDEBAR DRAWER DARI KANAN */}
      {isDemoDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div
            className="absolute inset-0"
            onClick={() => setIsDemoDrawerOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header Drawer */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Demo Drawer Kanan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Implementasi standar Right-Hand Drawer</p>
                </div>
              </div>

              <button
                onClick={() => setIsDemoDrawerOpen(false)}
                className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-4 rounded-[10px] bg-violet-50/60 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 space-y-2">
                <p className="text-xs font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Kompatibilitas DESIGN.md</span>
                </p>
                <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                  Drawer ini bergeser dari sebelah kanan dengan ukuran responsif (`max-w-md sm:max-w-lg`) dan `overflow-y-auto` untuk memastikan form tetap nyaman diisi.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contoh Input Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    defaultValue="PT Tech Innovasi Indonesia"
                    className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contoh Pilihan Status Tahapan
                  </label>
                  <select className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Screening CV</option>
                    <option>Interview User</option>
                    <option>Offering Letter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsDemoDrawerOpen(false)}
                className="px-5 py-2.5 rounded-[10px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Demo
              </button>
              <button
                onClick={() => setIsDemoDrawerOpen(false)}
                className="px-6 py-2.5 rounded-[10px] text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
