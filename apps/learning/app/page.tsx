'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  Star,
  Clock,
  GraduationCap,
  Sparkles,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  BrainCircuit,
  Database,
  Code2,
  Palette,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { COURSES, Course } from '@/lib/courses-data';
import { cn } from '@/lib/utils';

export default function CatalogPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const subjects = [
    { label: 'Semua Bidang', value: 'Semua', icon: Sparkles },
    { label: 'AI & Machine Learning', value: 'Artificial Intelligence', icon: BrainCircuit },
    { label: 'Data Science & Analytics', value: 'Data Science', icon: Database },
    { label: 'Computer Science & Web', value: 'Computer Science', icon: Code2 },
    { label: 'UI/UX & Desain', value: 'UI/UX Design', icon: Palette },
    { label: 'Bisnis & Fintech', value: 'Business & Career', icon: Briefcase },
  ];

  const levels = ['Semua', 'Beginner', 'Intermediate', 'Advanced'];
  const credentialTypes = ['Semua', 'Professional Certificate', 'Specialization', 'Course'];

  const toggleBookmark = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const filteredCourses = useMemo(() => {
    return COURSES.filter((course) => {
      const matchSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skillsGained.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSubject =
        selectedSubject === 'Semua' || course.subject === selectedSubject;

      const matchLevel =
        selectedLevel === 'Semua' || course.level === selectedLevel;

      const matchType =
        selectedType === 'Semua' || course.credentialType === selectedType;

      return matchSearch && matchSubject && matchLevel && matchType;
    });
  }, [searchQuery, selectedSubject, selectedLevel, selectedType]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner Section */}
          <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-[#1738D1] via-[#1F3578] to-[#0C1738] p-6 md:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Standar Industri Global & Mitra Universitas</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Tingkatkan Karier dengan Kursus & Sertifikat Terakreditasi
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Pelajari materi terstruktur dari Stanford, Google, Meta, dan DeepLearning.AI. Selesaikan kuis interaktif, dipandu AI Coach, dan raih sertifikat digital resmi untuk portofolio lamaran kerjamu.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-blue-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sertifikat Terverifikasi QR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Transkrip Sinkron & Timestamp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Quiz Engine & AI Learning Coach</span>
                </div>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Subject Horizontal Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subjects.map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedSubject === sub.value;

              return (
                <button
                  key={sub.value}
                  onClick={() => setSelectedSubject(sub.value)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border',
                    isSelected
                      ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm shadow-[#1738D1]/25'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Secondary Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan topik, judul, keahlian, atau nama instruktur..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Level Dropdown */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="Beginner">Pemula (Beginner)</option>
                <option value="Intermediate">Menengah (Intermediate)</option>
                <option value="Advanced">Mahir (Advanced)</option>
              </select>

              {/* Type Dropdown */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Kredensial</option>
                <option value="Specialization">Spesialisasi</option>
                <option value="Professional Certificate">Sertifikat Profesional</option>
                <option value="Course">Kursus Mandiri</option>
              </select>
            </div>
          </div>

          {/* Results Count & Active Status */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan <strong className="text-slate-900 dark:text-white font-bold">{filteredCourses.length}</strong> kursus tersedia
            </span>
            {(selectedSubject !== 'Semua' || selectedLevel !== 'Semua' || selectedType !== 'Semua' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSubject('Semua');
                  setSelectedLevel('Semua');
                  setSelectedType('Semua');
                  setSearchQuery('');
                }}
                className="text-[#1738D1] dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          {/* Course Grid (Bento Architecture) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const isSaved = savedCourses.includes(course.id);

              return (
                <div
                  key={course.id}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden"
                >
                  {/* Card Thumbnail & Partner Banner */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Partner Badge Top-Left */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-slate-900 dark:text-white shadow-xs border border-white/20">
                      <span>{course.partner.name}</span>
                    </div>

                    {/* Bookmark Action Top-Right */}
                    <button
                      onClick={(e) => toggleBookmark(course.id, e)}
                      className={cn(
                        'absolute top-3 right-3 p-2 rounded-[8px] backdrop-blur-md transition cursor-pointer shadow-xs',
                        isSaved
                          ? 'bg-[#1738D1] text-white'
                          : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
                      )}
                      aria-label="Simpan Kursus"
                      title={isSaved ? 'Hapus dari Tersimpan' : 'Simpan Kursus'}
                    >
                      <Bookmark className={cn('w-4 h-4', isSaved && 'fill-white')} />
                    </button>

                    {/* Credential Badge Bottom-Left */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#1738D1] text-white text-[10px] font-extrabold uppercase tracking-wide">
                        {course.credentialType}
                      </span>
                      <span className="px-2 py-0.5 rounded-[4px] bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <Link href={`/kursus/${course.slug}`}>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1738D1] dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.subtitle}
                      </p>
                    </div>

                    {/* Skills Gained Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.skillsGained.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skillsGained.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                          +{course.skillsGained.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Footer Metadata & CTA */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{course.rating}</span>
                          <span className="text-slate-400 font-normal">({(course.reviewCount / 1000).toFixed(1)}k)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.totalHours}</span>
                        </div>
                      </div>

                      <Link
                        href={`/kursus/${course.slug}`}
                        className="px-3 py-1.5 rounded-[8px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs shadow-[#1738D1]/20 cursor-pointer"
                      >
                        <span>Lihat</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tidak ada kursus yang cocok dengan filter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau reset filter subjek dan tingkat kesulitan.
              </p>
              <button
                onClick={() => {
                  setSelectedSubject('Semua');
                  setSelectedLevel('Semua');
                  setSelectedType('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-[8px] bg-[#1738D1] text-white text-xs font-bold cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
