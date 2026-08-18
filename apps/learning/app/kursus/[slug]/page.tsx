'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import {
  Star,
  Clock,
  GraduationCap,
  Sparkles,
  Bookmark,
  Share2,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Award,
  Globe,
  Users,
  ShieldCheck,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { COURSES } from '@/lib/courses-data';
import { cn } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const course = COURSES.find((c) => c.slug === slug);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openWeek, setOpenWeek] = useState<number>(1);
  const [isSaved, setIsSaved] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white dark:bg-slate-900 p-8 rounded-[10px] border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kursus Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">Kursus yang kamu cari tidak tersedia atau tautan salah.</p>
          <Link href="/" className="inline-block px-4 py-2 rounded-[8px] bg-[#1738D1] text-white text-xs font-bold">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const firstLessonId = course.syllabus[0]?.lessons[0]?.id || 'les-1-1';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-[#1738D1] transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Katalog Kursus</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{course.subject}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs">{course.title}</span>
          </div>

          {/* Hero Course Overview Banner */}
          <div className="relative rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Cols: Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-extrabold uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{course.partner.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    {course.credentialType}
                  </span>
                  <span className="px-2.5 py-1 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {course.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Rating & Stats row */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-[6px] border border-amber-200 dark:border-amber-900/50">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-slate-500 font-normal">({course.reviewCount.toLocaleString('id-ID')} ulasan)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span><strong>{course.enrolledCount.toLocaleString('id-ID')}</strong> siswa terdaftar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>{course.language}</span>
                  </div>
                </div>

                {/* Instructor Quick Mini Card */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {course.instructor.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {course.instructor.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Enrollment Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="relative h-44 w-full rounded-[8px] overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Link
                      href={`/kursus/${course.slug}/belajar/${firstLessonId}`}
                      className="w-12 h-12 rounded-full bg-[#1738D1] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <PlayCircle className="w-7 h-7 fill-white/20" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Akses Kursus:</span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[4px]">
                      Gratis dengan Membership
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Sertifikat Digital:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Termasuk Verifikasi QR</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/kursus/${course.slug}/belajar/${firstLessonId}`}
                    className="w-full py-3 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1738D1]/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span>Mulai Belajar Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={cn(
                        'flex-1 py-2 rounded-[10px] text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer',
                        isSaved
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-[#1738D1] text-[#1738D1] dark:text-blue-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
                      <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                    </button>
                    <button
                      onClick={() => alert('Tautan kursus disalin ke clipboard!')}
                      className="p-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                      title="Bagikan Kursus"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Yang Akan Kamu Pelajari (Learning Outcomes) */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Yang Akan Kamu Pelajari</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {outcome}
                  </span>
                </div>
              ))}
            </div>

            {/* Skills Badges */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Keahlian yang Akan Kamu Kuasai (Skills Gained):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.skillsGained.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-[6px] bg-blue-50 dark:bg-blue-950/80 text-[#1738D1] dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Silabus Mingguan Modular */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Silabus & Kurikulum Mingguan
                </h2>
                <p className="text-xs text-slate-500">
                  {course.syllabus.length} Modul Terstruktur • Total {course.totalHours}
                </p>
              </div>
              <span className="text-xs font-bold text-[#1738D1] dark:text-blue-400">
                100% Fleksibel
              </span>
            </div>

            {/* Syllabus Accordion */}
            <div className="space-y-3 pt-2">
              {course.syllabus.map((module) => {
                const isOpen = openWeek === module.weekNumber;

                return (
                  <div
                    key={module.id}
                    className="rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50"
                  >
                    <button
                      onClick={() => setOpenWeek(isOpen ? 0 : module.weekNumber)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-[4px] bg-[#1738D1] text-white text-[10px] font-extrabold uppercase">
                            Minggu {module.weekNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {module.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {module.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                          {module.estimatedHours}
                        </span>
                        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                        {module.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/kursus/${course.slug}/belajar/${lesson.id}`}
                            className="flex items-center justify-between p-2.5 rounded-[8px] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                                {lesson.type === 'video' ? (
                                  <PlayCircle className="w-4 h-4 text-[#1738D1]" />
                                ) : lesson.type === 'quiz' ? (
                                  <HelpCircle className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <FileText className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#1738D1] transition">
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>{lesson.duration}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Profil Instruktur & Mitra */}
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Instruktur Pengampu
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#1738D1] shrink-0">
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {course.instructor.name}
                </h3>
                <p className="text-xs font-semibold text-[#1738D1] dark:text-blue-400">
                  {course.instructor.role}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
