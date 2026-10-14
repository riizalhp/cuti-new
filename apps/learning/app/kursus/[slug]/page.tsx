'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Star,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Globe,
  Users,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { COURSES } from '@/lib/courses-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const course = COURSES.find((c) => c.slug === slug);

  const [openWeek, setOpenWeek] = useState<number>(1);
  const [isSaved, setIsSaved] = useState(false);

  if (!course) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center p-6">
          <div className="text-center space-y-3 bg-white dark:bg-slate-900 p-6 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs max-w-md">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Kursus Tidak Ditemukan</h2>
            <p className="text-caption text-slate-500">Kursus yang kamu cari tidak tersedia atau tautan salah.</p>
            <Link href="/">
              <Button size="sm">Kembali ke Katalog</Button>
            </Link>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  const firstLessonId = course.syllabus[0]?.lessons[0]?.id || 'les-1-1';

  return (
    <LayoutWrapper>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-caption font-medium text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-cobalt-500 transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Katalog</span>
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">{course.subject}</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs">{course.title}</span>
      </div>

      {/* Hero Course Overview Banner */}
      <div className="relative rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2 Cols: Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{course.partner.name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                {course.credentialType}
              </span>
              <span className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                {course.level}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.subtitle}
            </p>

            {/* Rating & Stats row */}
            <div className="flex flex-wrap items-center gap-3 text-caption font-medium text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1 font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-[6px] border border-amber-200 dark:border-amber-900/50">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{course.rating}</span>
                <span className="text-slate-500 font-normal">({course.reviewCount.toLocaleString('id-ID')} ulasan)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span><strong>{course.enrolledCount.toLocaleString('id-ID')}</strong> siswa</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.language}</span>
              </div>
            </div>

            {/* Instructor Quick Mini Card */}
            <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
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
                <p className="text-caption text-slate-500 dark:text-slate-400">
                  {course.instructor.role}
                </p>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Enrollment Card */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="relative h-36 w-full rounded-[8px] overflow-hidden">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Link
                  href={`/kursus/${course.slug}/belajar/${firstLessonId}`}
                  className="w-10 h-10 rounded-full bg-cobalt-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <PlayCircle className="w-6 h-6 fill-white/20" />
                </Link>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-caption text-slate-500 font-medium">Akses Kursus:</span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-[4px]">
                  Gratis dengan Membership
                </span>
              </div>
              <div className="flex items-center justify-between text-caption text-slate-600 dark:text-slate-400">
                <span>Sertifikat Digital:</span>
                <span className="font-bold text-slate-900 dark:text-white">Verifikasi QR</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link href={`/kursus/${course.slug}/belajar/${firstLessonId}`} className="block">
                <Button className="w-full text-xs font-bold gap-1.5">
                  <span>Mulai Belajar</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant={isSaved ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex-1 text-caption font-bold"
                >
                  <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
                  <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-[38px]"
                  onClick={() => alert('Tautan kursus disalin ke clipboard!')}
                  title="Bagikan Kursus"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Yang Akan Kamu Pelajari (Learning Outcomes) */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Yang Akan Kamu Pelajari</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {course.learningOutcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-caption text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {outcome}
              </span>
            </div>
          ))}
        </div>

        {/* Skills Badges */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-caption font-bold text-slate-900 dark:text-white mb-1.5">
            Keahlian yang Akan Dikuasai (Skills Gained):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {course.skillsGained.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-[6px] bg-blue-50 dark:bg-blue-950/80 text-cobalt-500 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Silabus Mingguan Modular */}
      <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Silabus & Kurikulum Mingguan
            </h2>
            <p className="text-caption text-slate-500">
              {course.syllabus.length} Modul Terstruktur • Total {course.totalHours}
            </p>
          </div>
          <span className="text-caption font-bold text-cobalt-500 dark:text-blue-400">
            100% Fleksibel
          </span>
        </div>

        {/* Syllabus Accordion */}
        <div className="space-y-2.5 pt-1">
          {course.syllabus.map((module) => {
            const isOpen = openWeek === module.weekNumber;

            return (
              <div
                key={module.id}
                className="rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50"
              >
                <button
                  onClick={() => setOpenWeek(isOpen ? 0 : module.weekNumber)}
                  className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.2 rounded-[4px] bg-cobalt-500 text-white text-[9px] font-extrabold uppercase">
                        Minggu {module.weekNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {module.title}
                      </span>
                    </div>
                    <p className="text-caption text-slate-500 dark:text-slate-400">
                      {module.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {module.estimatedHours}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 pt-1.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/kursus/${course.slug}/belajar/${lesson.id}`}
                        className="flex items-center justify-between p-2 rounded-[8px] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            {lesson.type === 'video' ? (
                              <PlayCircle className="w-3.5 h-3.5 text-cobalt-500" />
                            ) : lesson.type === 'quiz' ? (
                              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-cobalt-500 transition">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-caption text-slate-500">
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
      <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Instruktur Pengampu
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cobalt-500 shrink-0">
            <Image
              src={course.instructor.avatar}
              alt={course.instructor.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {course.instructor.name}
            </h3>
            <p className="text-caption font-semibold text-cobalt-500 dark:text-blue-400">
              {course.instructor.role}
            </p>
            <p className="text-caption text-slate-600 dark:text-slate-400 leading-relaxed">
              {course.instructor.bio}
            </p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
