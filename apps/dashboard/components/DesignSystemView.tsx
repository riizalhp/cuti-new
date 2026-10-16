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
import { GooeyNav } from '@/components/ui/gooey-nav';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Field, Input } from '@/components/ui/field';
import { AsyncState } from '@/components/ui/async-state';
import { useToast } from '@/components/ui/Toast';

export const DesignSystemView: React.FC = () => {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDemoDrawerOpen, setIsDemoDrawerOpen] = useState(false);
  const [bellDemoCount, setBellDemoCount] = useState(3);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'colors' | 'typography' | 'components' | 'scores'>('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full space-y-8 pb-16 font-sans" suppressHydrationWarning>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cobalt-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-[10px] text-xs font-bold bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                Employr Design System Standard
              </span>
              <span className="px-2.5 py-0.5 rounded-[10px] text-caption font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
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
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsDemoDrawerOpen(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Uji Drawer Kanan</span>
            </Button>
            <a
              href="#design-md-doc"
              onClick={() => copyToClipboard('Employr Design System Rules', 'Aturan')}
              className="px-4 py-2 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{copiedCode === 'Aturan' ? 'Tersalin!' : 'Salin Aturan'}</span>
            </a>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Tabs
            value={activeSubTab}
            onValueChange={(val) => setActiveSubTab(val as any)}
          >
            <TabsList variant="pill" className="flex-wrap">
              <TabsTrigger size="sm" value="overview" className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>5 Pilar Utama</span>
              </TabsTrigger>
              <TabsTrigger size="sm" value="colors" className="flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                <span>Palet Warna (Orange &amp; Navy)</span>
              </TabsTrigger>
              <TabsTrigger size="sm" value="scores" className="flex items-center gap-1.5">
                <PieChart className="w-4 h-4" />
                <span>Standar Skor (Kotak vs Radial)</span>
              </TabsTrigger>
              <TabsTrigger size="sm" value="typography" className="flex items-center gap-1.5">
                <Type className="w-4 h-4" />
                <span>Tipografi (Inter)</span>
              </TabsTrigger>
              <TabsTrigger size="sm" value="components" className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Komponen &amp; Drawer</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* SECTION 1: CORE PRINCIPLES */}
      {(activeSubTab === 'overview') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-700 dark:text-orange-400" />
              <span>5 Pilar Utama System Desain Employr</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pilar 1 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Strict Lucide Icons Only</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tanpa emoticon/emoji kasar pada antarmuka. Seluruh visual indicator menggunakan ikon SVG dari <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-[10px] font-mono text-caption text-orange-700 dark:text-orange-400">lucide-react</code>.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-100 dark:border-navy-900/50 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bento Grid &amp; Rounded 10px</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pengelompokan informasi secara modular (`grid-cols-12`). Sudut kartu, badge, dan modal terstandarisasi <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-[10px] font-mono text-caption">rounded-[10px]</code>.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Score: Kotak vs Radial Ring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Skor di widget/kartu wajib berbentuk **Kotak + Horizontal Bar**. Bentuk **Bulat Radial SVG** khusus untuk 1 Master Hero Score diagnostik.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
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
              <Palette className="w-5 h-5 text-orange-700 dark:text-orange-400" />
              <span>Palet Warna &amp; Hirarki Tombol</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Tailwind CSS Employr Tokens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Swatch 1: Primary Action Cobalt */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Primary Action (CTA)</span>
                <span className="text-caption font-mono bg-blue-50 dark:bg-blue-950 text-cobalt-500 dark:text-blue-400 px-2 py-0.5 rounded-[10px]">SELALU COBALT</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-cobalt-500 flex items-end p-2 text-caption font-bold text-white shadow-xs">#1738D1</div>
                <div className="h-12 rounded-[10px] bg-[#132EA8] flex items-end p-2 text-caption font-bold text-white shadow-xs">#132EA8</div>
                <div className="h-12 rounded-[10px] bg-blue-50 dark:bg-blue-950 text-cobalt-500 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-end p-2 text-caption font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk aksi bernilai tinggi: Beli Paket, Simpan Lamaran, Buat CV, Ambil Misi.</p>
            </div>

            {/* Swatch 2: Brand Navy */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Brand Primary (Navy)</span>
                <span className="text-caption font-mono bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 px-2 py-0.5 rounded-[10px]">Brand Identity</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-navy-700 flex items-end p-2 text-caption font-bold text-white shadow-xs">#1F3578</div>
                <div className="h-12 rounded-[10px] bg-navy-500 flex items-end p-2 text-caption font-bold text-white shadow-xs">#3B5CC4</div>
                <div className="h-12 rounded-[10px] bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800 flex items-end p-2 text-caption font-bold">50 / 950</div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk brand header, navbar/sidebar brand highlight, dan filter data.</p>
            </div>

            {/* Swatch 3: Success Emerald */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Success Emerald</span>
                <span className="text-caption font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-[10px]">Status Positive</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-[10px] bg-emerald-700 flex items-end p-2 text-caption font-bold text-white shadow-xs">#059669</div>
                <div className="h-12 rounded-[10px] bg-emerald-700 flex items-end p-2 text-caption font-bold text-white shadow-xs">#10B981</div>
                <div className="h-12 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-end p-2 text-caption font-bold">50 / 950</div>
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
              <PieChart className="w-5 h-5 text-orange-700 dark:text-orange-400" />
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
                <span className="text-caption font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-[10px]">
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
                    <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">CV ATS Score</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">86/100</span>
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
                <span className="text-caption font-bold bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-2 py-0.5 rounded-[10px]">
                  Hero Diagnostic Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hanya dipakai pada header halaman audit diagnostik mendalam (seperti Simulasi Screening).
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
                      className="text-orange-700 dark:text-orange-400"
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
                  <p className="text-caption text-slate-500">Animasi radial circular ring presisi</p>
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
              <Type className="w-5 h-5 text-orange-700 dark:text-orange-400" />
              <span>Hierarki Tipografi Resmi (Inter)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Inter / JetBrains Mono</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 font-mono mb-1">Page Title / Hero Heading (Inter / text-2xl / font-extrabold)</p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Ringkasan Progres Karier &amp; Lamaran Kerja</h1>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0 dark:text-slate-400">24px / 1.25</span>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 font-mono mb-1">Body Text (Inter / text-sm / font-medium)</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Pantau terus jadwal interview serta status tindak lanjut recruiter dari setiap perusahaan yang Anda lamar.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 shrink-0 dark:text-slate-400">14px / 1.5</span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: BUTTON & BADGE SHOWCASE */}
      {(activeSubTab === 'overview' || activeSubTab === 'components') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-700 dark:text-orange-400" />
              <span>Komponen UI &amp; Demo Drawer Kanan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Variasi Tombol (Standard Button Primitives)
              </h3>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2.5 items-center">
                  <Button variant="primary" size="sm">
                    <Plus />
                    <span>Primary SM</span>
                  </Button>
                  <Button variant="primary" size="md">
                    <Plus />
                    <span>Primary MD</span>
                  </Button>
                  <Button variant="primary" size="lg">
                    <Plus />
                    <span>Primary LG</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  <Button variant="secondary" size="sm">
                    Secondary Dark
                  </Button>
                  <Button variant="outline" size="sm">
                    Outline
                  </Button>
                  <Button variant="ghost" size="sm">
                    Ghost
                  </Button>
                  <Button variant="danger" size="sm">
                    <XCircle />
                    <span>Danger Action</span>
                  </Button>
                  <Button variant="primary" size="sm" loading>
                    <span>Menyimpan</span>
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span className="text-caption font-semibold text-slate-500">IconButton:</span>
                  <IconButton label="Edit item" size="sm" variant="outline">
                    <SlidersHorizontal />
                  </IconButton>
                  <IconButton label="Hapus item" size="sm" variant="danger">
                    <XCircle />
                  </IconButton>
                  <IconButton label="Tambah data" size="md" variant="primary">
                    <Plus />
                  </IconButton>
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Aturan Baku Hierarki Tombol:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><strong>Primary CTA:</strong> Wajib Teks + Ikon (e.g. + Tambah, Cari Loker).</li>
                    <li><strong>Icon-Only Button:</strong> Gunakan <code>IconButton</code> untuk aksi cepat &amp; hemat tempat (Salin, Refresh, Hapus baris, [X] Tutup).</li>
                    <li><strong>Modal &amp; Form:</strong> Tombol Batal, Tutup, dan Simpan wajib teks polos agar tidak menimbulkan visual clutter.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Badges & Pills */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Badges &amp; Status Tags (All rounded-[10px])
              </h3>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-blue-50 dark:bg-blue-950 text-cobalt-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cobalt-500" />
                  Rekomendasi Utama
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Offering Diterima
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Interview Besok
                </span>

                <span className="px-2.5 py-1 rounded-[10px] text-caption font-bold bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                  ATS Score 92%
                </span>
              </div>
            </div>

            {/* Field & Input Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Field &amp; Input Accessible Forms
              </h3>

              <div className="space-y-3">
                <Field
                  label="Nama Perusahaan"
                  required
                  hint="Masukkan nama resmi instansi atau perusahaan."
                >
                  <Input defaultValue="PT Maju Bersama Digital" />
                </Field>

                <Field
                  label="Email Rekruter"
                  error="Format email tidak valid (harus mengandung @)."
                >
                  <Input defaultValue="hrd.perusahaan.com" />
                </Field>
              </div>
            </div>

            {/* Tabs & AsyncState Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Radix Tabs &amp; AsyncState Pattern
              </h3>

              <div className="space-y-4">
                <Tabs defaultValue="tab1">
                  <TabsList variant="pill">
                    <TabsTrigger value="tab1" size="sm">Kanban</TabsTrigger>
                    <TabsTrigger value="tab2" size="sm">Tabel</TabsTrigger>
                    <TabsTrigger value="tab3" size="xs">Arsip (Chip)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                    Konten tampilan Kanban aktif dengan keyboard navigation.
                  </TabsContent>
                  <TabsContent value="tab2" className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                    Konten tampilan Tabel terstruktur.
                  </TabsContent>
                  <TabsContent value="tab3" className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                    Konten arsip lama.
                  </TabsContent>
                </Tabs>

                <AsyncState
                  error="Gagal menyinkronkan data lowongan terbaru."
                  onRetry={() => {}}
                >
                  <div />
                </AsyncState>
              </div>
            </div>

            {/* Notification Bell Animated Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Animated Notification Bell (Rare UI Spring Physics)
                </h3>
                <span className="text-caption font-mono text-slate-500 dark:text-slate-400">
                  Spring Inertia + Rolling Digit Counter
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-6">
                  {/* Default Size */}
                  <div className="flex flex-col items-center gap-1.5">
                    <NotificationBell
                      count={bellDemoCount}
                      size={44}
                      color="red"
                      onClick={() => setBellDemoCount(prev => prev + 1)}
                    />
                    <span className="text-caption text-slate-500 font-medium">Standard (44px)</span>
                  </div>

                  {/* Header Compact Size */}
                  <div className="flex flex-col items-center gap-1.5">
                    <NotificationBell
                      count={bellDemoCount}
                      size={36}
                      color="red"
                      className="border border-slate-200/60 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
                      onClick={() => setBellDemoCount(prev => prev + 1)}
                    />
                    <span className="text-caption text-slate-500 font-medium">Header (36px)</span>
                  </div>

                  {/* Dot Variant */}
                  <div className="flex flex-col items-center gap-1.5">
                    <NotificationBell
                      count={bellDemoCount}
                      size={36}
                      variant="dot"
                      color="orange"
                      className="border border-slate-200/60 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
                      onClick={() => setBellDemoCount(prev => prev + 1)}
                    />
                    <span className="text-caption text-slate-500 font-medium">Dot Variant</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBellDemoCount(prev => Math.max(0, prev - 1))}
                  >
                    -1 Notif
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setBellDemoCount(prev => prev + 1)}
                  >
                    +1 Notif (Ring)
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBellDemoCount(0)}
                  >
                    Reset (0)
                  </Button>
                </div>
              </div>
            </div>

            {/* System Toast Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sistem Notifikasi Toast (Presisi Tengah di Mobile, Kanan Atas di Desktop)
                </h3>
                <span className="text-caption font-mono text-slate-500 dark:text-slate-400">
                  Global Toast Provider &bull; inset-x-0 mx-auto
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Diakses melalui <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">useToast()</code> di semua halaman dashboard pengguna. Di mobile (&lt; 640px) posisinya presisi di tengah secara simetris, sedangkan di desktop menempel di sudut kanan atas.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 cursor-pointer"
                  onClick={() => toast.success('CV Berhasil Disimpan', 'Semua perubahan berhasil disinkronkan ke profil kamu.')}
                >
                  Test Toast Sukses
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 cursor-pointer"
                  onClick={() => toast.error('Gagal Menyimpan Lamaran', 'Periksa koneksi internet Anda dan coba lagi.')}
                >
                  Test Toast Error
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 cursor-pointer"
                  onClick={() => toast.warning('Ukuran Berkas Terlalu Besar', 'Maksimal ukuran file foto adalah 2MB.')}
                >
                  Test Toast Warning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-cobalt-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 cursor-pointer"
                  onClick={() => toast.info('Data Disinkronkan', 'Daftar lamaran kerja berhasil diperbarui.')}
                >
                  Test Toast Info
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DEMO SIDEBAR DRAWER DARI KANAN MENGGUNAKAN ACCESSIBLE SHEET */}
      <Sheet open={isDemoDrawerOpen} onOpenChange={setIsDemoDrawerOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center shadow-md shrink-0">
                <SlidersHorizontal className="size-5" />
              </div>
              <div>
                <SheetTitle>Demo Drawer Kanan</SheetTitle>
                <SheetDescription>
                  Implementasi standar Right-Hand Sheet berbasis Radix UI
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <SheetBody className="space-y-4">
            <div className="p-4 rounded-[10px] bg-orange-50/60 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 space-y-2">
              <p className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <span>Kompatibilitas Standar Employr</span>
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                Drawer ini bergeser dari sebelah kanan dengan ukuran responsif (`max-w-md sm:max-w-xl`) dan `overflow-y-auto` untuk memastikan form tetap nyaman diisi. Focus trap dan tombol Escape ditangani otomatis.
              </p>
            </div>

            <div className="space-y-3">
              <Field label="Contoh Input Nama Perusahaan" required>
                <Input defaultValue="PT Tech Innovasi Indonesia" />
              </Field>

              <Field label="Contoh Pilihan Status Tahapan">
                <select
                  defaultValue="Screening CV"
                  className="w-full h-[40px] px-3.5 text-sm rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <option>Screening CV</option>
                  <option>Interview User</option>
                  <option>Offering Letter</option>
                </select>
              </Field>
            </div>
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDemoDrawerOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDemoDrawerOpen(false)}
            >
              Simpan Perubahan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
