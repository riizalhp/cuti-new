'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  GraduationCap,
  Bookmark,
  Flame,
  Clock,
  PlayCircle,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { COURSES } from '@/lib/courses-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function MyLearningDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inprogress' | 'completed' | 'saved'>('inprogress');

  const inProgressCourses = [
    {
      course: COURSES[0], // Machine Learning
      progress: 65,
      lastLessonTitle: '1.2 Memahami Cost Function & Gradient Descent',
      lastLessonId: 'les-1-2',
      hoursSpent: '8.5 Jam',
    },
    {
      course: COURSES[1], // Google Data Analytics
      progress: 30,
      lastLessonTitle: '1.1 Pengantar Analisis Data Modern',
      lastLessonId: 'les-g-1-1',
      hoursSpent: '4.0 Jam',
    },
  ];

  const completedCourses = [
    {
      course: COURSES[2], // Meta Front-End
      certificateId: 'EMP-2026-META-7712',
      completedDate: '12 Agustus 2026',
      grade: '96% (Distinction)',
    },
  ];

  const savedCoursesList = [COURSES[3], COURSES[4]];

  return (
    <LayoutWrapper>
      {/* Header & Streak Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
        {/* User Target Card (2 Cols) */}
        <div className="md:col-span-2 p-4 sm:p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cobalt-500 dark:text-blue-400">
              Dasbor Belajar Siswa
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Selamat Datang Kembali, Ahmad! 👋
            </h1>
            <p className="text-caption text-slate-500 dark:text-slate-400">
              Kamu telah menyelesaikan <strong>75%</strong> dari target belajar mingguanmu. Terus pertahankan ritme belajarmu!
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Target Jam Belajar Mingguan</span>
              <span className="text-cobalt-500 dark:text-blue-400 font-mono">4.5 / 6 Jam (75%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cobalt-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Streak & Achievement Mini Card (1 Col) */}
        <div className="p-4 sm:p-5 rounded-[10px] bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Flame className="w-4 h-4 fill-white text-white animate-bounce" />
              </div>
              <div>
                <p className="text-caption font-bold opacity-90">Study Streak</p>
                <h3 className="text-base font-extrabold font-mono">5 Hari Beruntun</h3>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed">
            Belajar minimal 15 menit setiap hari untuk mempertahankan rentetan streak dan klaim bonus poin!
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'inprogress', label: `Sedang Berjalan (${inProgressCourses.length})`, icon: BookOpen },
          { id: 'completed', label: `Selesai & Sertifikat (${completedCourses.length})`, icon: GraduationCap },
          { id: 'saved', label: `Tersimpan (${savedCoursesList.length})`, icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition cursor-pointer border whitespace-nowrap',
                isActive
                  ? 'bg-cobalt-500 text-white border-cobalt-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: IN PROGRESS COURSES */}
      {activeTab === 'inprogress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {inProgressCourses.map((item) => (
            <div
              key={item.course.id}
              className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Image
                    src={item.course.thumbnail}
                    alt={item.course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold text-cobalt-500 dark:text-blue-400">
                    {item.course.partner.name}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.course.title}
                  </h3>
                  <p className="text-caption text-slate-500 dark:text-slate-400 line-clamp-1">
                    Lanjut ke: {item.lastLessonTitle}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-caption font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Progres Kursus</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{item.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-caption text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.hoursSpent} dipelajari
                </span>

                <Link href={`/kursus/${item.course.slug}/belajar/${item.lastLessonId}`}>
                  <Button size="sm" className="h-8 px-3 text-caption font-bold gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Lanjutkan Belajar</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COMPLETED & CERTIFICATES */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {completedCourses.map((item) => (
            <div
              key={item.course.id}
              className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Image
                    src={item.course.thumbnail}
                    alt={item.course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>KURSUS SELESAI 100%</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.course.title}
                  </h3>
                  <p className="text-caption text-slate-500">Lulus: {item.completedDate}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-caption">
                <div>
                  <span className="text-slate-500 block text-[9px]">ID Kredensial:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.certificateId}</span>
                </div>
                <span className="px-2 py-0.5 rounded-[6px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[9px]">
                  {item.grade}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href={`/kursus/${item.course.slug}`}
                  className="text-caption font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Ulas Silabus
                </Link>

                <Link href={`/sertifikat/${item.certificateId}`}>
                  <Button size="sm" className="h-8 px-3 text-caption font-bold gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Lihat Sertifikat</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SAVED COURSES */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {savedCoursesList.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-cobalt-500 dark:text-blue-400">
                    {course.partner.name}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-caption text-slate-500 line-clamp-2">{course.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-caption font-medium text-slate-500">{course.totalHours}</span>
                <Link href={`/kursus/${course.slug}`}>
                  <Button size="sm" className="h-8 px-3 text-caption font-bold">
                    Mulai Kursus
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </LayoutWrapper>
  );
}
