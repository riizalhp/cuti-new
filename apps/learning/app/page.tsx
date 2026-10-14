'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Star,
  Clock,
  Sparkles,
  Bookmark,
  ChevronRight,
  CheckCircle2,
  BrainCircuit,
  Database,
  Code2,
  Palette,
  Briefcase,
} from 'lucide-react';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { COURSES } from '@/lib/courses-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CatalogPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [savedCourses, setSavedCourses] = useState<string[]>([]);

  const subjects = [
    { label: 'Semua Bidang', value: 'Semua', icon: Sparkles },
    { label: 'AI & Machine Learning', value: 'Artificial Intelligence', icon: BrainCircuit },
    { label: 'Data Science & Analytics', value: 'Data Science', icon: Database },
    { label: 'Computer Science & Web', value: 'Computer Science', icon: Code2 },
    { label: 'UI/UX & Desain', value: 'UI/UX Design', icon: Palette },
    { label: 'Bisnis & Fintech', value: 'Business & Career', icon: Briefcase },
  ];

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
    <LayoutWrapper>
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-cobalt-500 via-navy-700 to-navy-900 p-5 sm:p-7 md:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white/10 backdrop-blur-md text-caption font-bold text-blue-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Standar Industri Global & Mitra Universitas</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Tingkatkan Karier dengan Kursus & Sertifikat Terakreditasi
          </h1>
          <p className="text-caption sm:text-xs text-blue-100/90 leading-relaxed max-w-xl">
            Pelajari materi terstruktur dari Stanford, Google, Meta, dan DeepLearning.AI. Selesaikan kuis interaktif, dipandu AI Coach, dan raih sertifikat digital resmi untuk portofolio lamaran kerjamu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-caption font-medium text-blue-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sertifikat Terverifikasi QR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transkrip Sinkron & Timestamp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quiz Engine & AI Learning Coach</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Subject Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          const isSelected = selectedSubject === sub.value;

          return (
            <button
              key={sub.value}
              onClick={() => setSelectedSubject(sub.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border',
                isSelected
                  ? 'bg-cobalt-500 text-white border-cobalt-500 shadow-sm shadow-cobalt-500/25'
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan topik, judul, keahlian, atau nama mitra..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-cobalt-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Level Dropdown */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
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
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[8px] text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Semua">Semua Kredensial</option>
            <option value="Specialization">Spesialisasi</option>
            <option value="Professional Certificate">Sertifikat Profesional</option>
            <option value="Course">Kursus Mandiri</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between text-caption font-medium text-slate-500 dark:text-slate-400">
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
            className="text-cobalt-500 dark:text-blue-400 font-bold hover:underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* Course Grid (Bento Architecture) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {filteredCourses.map((course) => {
          const isSaved = savedCourses.includes(course.id);

          return (
            <div
              key={course.id}
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-cobalt-300 dark:hover:border-cobalt-800 transition-all duration-200 overflow-hidden"
            >
              {/* Card Thumbnail & Partner Banner */}
              <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                {/* Partner Badge Top-Left */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-slate-900 dark:text-white shadow-2xs border border-white/20">
                  <span>{course.partner.name}</span>
                </div>

                {/* Bookmark Action Top-Right */}
                <button
                  onClick={(e) => toggleBookmark(course.id, e)}
                  className={cn(
                    'absolute top-2.5 right-2.5 p-1.5 rounded-[8px] backdrop-blur-md transition cursor-pointer shadow-xs',
                    isSaved
                      ? 'bg-cobalt-500 text-white'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
                  )}
                  aria-label="Simpan Kursus"
                  title={isSaved ? 'Hapus dari Tersimpan' : 'Simpan Kursus'}
                >
                  <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-white')} />
                </button>

                {/* Credential Badge Bottom-Left */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-[6px] bg-cobalt-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                    {course.credentialType}
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1.5">
                  <Link href={`/kursus/${course.slug}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-cobalt-500 dark:group-hover:text-blue-400 transition leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-caption text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.subtitle}
                  </p>
                </div>

                {/* Skills Gained Pills */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {course.skillsGained.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {course.skillsGained.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[9px] text-slate-400 font-bold">
                      +{course.skillsGained.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer Metadata & CTA */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-caption font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{course.rating}</span>
                      <span className="text-slate-400 font-normal">({(course.reviewCount / 1000).toFixed(1)}k)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{course.totalHours}</span>
                    </div>
                  </div>

                  <Link href={`/kursus/${course.slug}`}>
                    <Button size="sm" className="h-8 px-3 text-caption font-bold">
                      <span>Lihat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Sparkles className="w-7 h-7 text-slate-400 mx-auto" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Tidak ada kursus yang cocok dengan filter
          </h3>
          <p className="text-caption text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter subjek dan tingkat kesulitan.
          </p>
          <Button
            onClick={() => {
              setSelectedSubject('Semua');
              setSelectedLevel('Semua');
              setSelectedType('Semua');
              setSearchQuery('');
            }}
            size="sm"
          >
            Reset Semua Filter
          </Button>
        </div>
      )}
    </LayoutWrapper>
  );
}
