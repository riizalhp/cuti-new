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
  FileText,
  Mail,
  Users,
  Award,
  TrendingUp,
  Download,
  ExternalLink,
  BookOpen,
  Smartphone,
  PieChart,
} from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'colors' | 'typography' | 'components' | 'scores'>('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#1738D1]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-[10px] text-xs font-bold bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Employr Design System Standard
              </span>
              <span className="px-2.5 py-0.5 rounded-[10px] text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                v2.0 Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panduan &amp; Standar Desain Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dokumen interaktif resmi antarmuka **Employr**. Memastikan konsistensi CTA Orange vs Brand Navy, aturan Score Kotak vs Bulat Radial, eliminasi emoji kasar, serta arsitektur Bento Grid dan Mobile Bottom Navigation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDemoDrawerOpen(true)}
              className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Uji Drawer Kanan</span>
            </button>
            <a
              href="#design-md-doc"
              onClick={() => copyToClipboard('Employr Design System Rules', 'Aturan')}
              className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{copiedCode === 'Aturan' ? 'Tersalin!' : 'Salin Aturan'}</span>
            </a>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: '5 Pilar Utama', icon: ShieldCheck },
            { id: 'colors', label: 'Palet Warna (Orange & Navy)', icon: Palette },
            { id: 'scores', label: 'Standar Skor (Kotak vs Radial)', icon: PieChart },
            { id: 'typography', label: 'Tipografi (Satoshi)', icon: Type },
            { id: 'components', label: 'Komponen & Drawer', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-[10px] text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1738D1] text-white shadow-xs'
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
      {(activeSubTab === 'overview') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              <span>5 Pilar Utama System Desain Employr</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pilar 1 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Strict Lucide Icons Only</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tanpa emoticon/emoji kasar pada antarmuka. Seluruh visual indicator menggunakan ikon SVG dari <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-[10px] font-mono text-[11px] text-orange-600 dark:text-orange-400">lucide-react</code>.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-100 dark:border-navy-900/50 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bento Grid &amp; Rounded 10px</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pengelompokan informasi secara modular (`grid-cols-12`). Sudut kartu, badge, dan modal terstandarisasi <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-[10px] font-mono text-[11px]">rounded-[10px]</code>.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Score: Kotak vs Radial Ring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Skor di widget/kartu wajib berbentuk **Kotak + Horizontal Bar**. Bentuk **Bulat Radial SVG** khusus untuk 1 Master Hero Score diagnostik.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Right-Hand Slide-in Drawer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formulir kompleks (seperti Tambah Lamaran) bergeser dari kanan layar (`slide-in-from-right`), menjaga konteks halaman tetap terlihat.
              </p>
            </div>

            {/* Pilar 5 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-navy-900/50 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mobile Bottom Navigation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Navigasi satu-jempol mobile dengan fixed **Bottom Navigation (5 tab)** di bawah layar (&lt; 1024px) tanpa hamburger fullscreen.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: COLOR PALETTE & BUTTON HIERARCHY */}
      {(activeSubTab === 'overview' || activeSubTab === 'colors') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-500" />
              <span>Palet Warna &amp; Hirarki Tombol</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Tailwind CSS Employr Tokens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Swatch 1: Primary Action Cobalt */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Primary Action (CTA)</span>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 px-2 py-0.5 rounded-[10px]">SELALU COBALT</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-[#1738D1] flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#1738D1</div>
                <div className="h-12 rounded-[10px] bg-[#132EA8] flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#132EA8</div>
                <div className="h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950 text-[#1738D1] dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk aksi bernilai tinggi: Beli Paket, Simpan Lamaran, Buat CV, Ambil Misi.</p>
            </div>

            {/* Swatch 2: Brand Navy */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Brand Primary (Navy)</span>
                <span className="text-[10px] font-mono bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 px-2 py-0.5 rounded-[10px]">Brand Identity</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-navy-700 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#1F3578</div>
                <div className="h-12 rounded-[10px] bg-navy-500 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#3B5CC4</div>
                <div className="h-12 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk brand header, navbar/sidebar brand highlight, dan filter data.</p>
            </div>

            {/* Swatch 3: Success Emerald */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Success Emerald</span>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-[10px]">Status Positive</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-emerald-600 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#059669</div>
                <div className="h-12 rounded-[10px] bg-emerald-500 flex items-end p-2 text-[10px] font-bold text-white shadow-xs">#10B981</div>
                <div className="h-12 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-end p-2 text-[10px] font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk status Offering, reward referral, dan indikator keberhasilan.</p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: SCORE DISPLAY STANDARDS (KOTAK VS RADIAL) */}
      {(activeSubTab === 'overview' || activeSubTab === 'scores') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" />
              <span>Standar Visualisasi Skor: Kotak vs Bulat Radial</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard 1: Kotak Bento Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Format Kotak (Default 90% UI Bento Grid)
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-[10px]">
                  Card &amp; List Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan format kotak pada kartu Beranda, list, dan tabel dengan horizontal progress bar.
              </p>

              {/* Demo Box Score */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">CV ATS Score</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">86/100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }} />
                </div>
              </div>
            </div>

            {/* Standard 2: Master Hero Radial Score */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Radial SVG Ring (Master Hero Diagnostik)
                </span>
                <span className="text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-2 py-0.5 rounded-[10px]">
                  Hero Diagnostic Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hanya dipakai pada header halaman audit diagnostik mendalam (seperti Evaluasi CV).
              </p>

              {/* Demo Radial Score */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-orange-500"
                      strokeDasharray="86, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-900 dark:text-white">86%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tingkat Kesiapan Kerja</h4>
                  <p className="text-[11px] text-slate-500">Animasi radial circular ring presisi</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: TYPOGRAPHY SHOWCASE */}
      {(activeSubTab === 'overview' || activeSubTab === 'typography') && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" />
              <span>Hierarki Tipografi Resmi (Satoshi)</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Satoshi / JetBrains Mono</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono mb-1">Page Title / Hero Heading (Satoshi / text-2xl / font-extrabold)</p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ringkasan Progres Karier &amp; Lamaran Kerja</h1>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">24px / 1.25</span>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono mb-1">Body Text (Satoshi / text-sm / font-medium)</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Pantau terus jadwal interview serta status tindak lanjut recruiter dari setiap perusahaan yang Anda lamar.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">14px / 1.5</span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: BUTTON & BADGE SHOWCASE */}
      {(activeSubTab === 'overview' || activeSubTab === 'components') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
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
                <button className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>Primary CTA (Cobalt)</span>
                </button>

                <button className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                  Secondary Dark
                </button>

                <button className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer">
                  Secondary Ghost
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
                Badges &amp; Status Tags (All rounded-[10px])
              </h3>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Rekomendasi Utama
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Offering Diterima
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Interview Besok
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                  ATS Score 92%
                </span>
              </div>
            </div>
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
                <div className="w-10 h-10 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center shadow-md">
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
              <div className="p-4 rounded-[10px] bg-orange-50/60 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 space-y-2">
                <p className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Kompatibilitas Standar Employr</span>
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
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
                className="px-6 py-2.5 rounded-[10px] text-xs font-bold bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white shadow-md shadow-[#1738D1]/20 transition cursor-pointer"
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
