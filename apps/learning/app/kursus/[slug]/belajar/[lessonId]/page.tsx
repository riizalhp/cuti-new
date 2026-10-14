'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  FileText,
  HelpCircle,
  MessageSquare,
  StickyNote,
  Bot,
  Send,
  ThumbsUp,
  Clock,
  ArrowLeft,
  Check,
  Award,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { COURSES, Lesson } from '@/lib/courses-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from '@/components/MarkdownContent';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const lessonId = params?.lessonId as string;

  const course = COURSES.find((c) => c.slug === slug);

  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Tab State: 'transcript' | 'notes' | 'discussion' | 'coach'
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'discussion' | 'coach'>('transcript');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Notes State
  const [notes, setNotes] = useState<{ id: string; timestamp: string; timeSec: number; text: string }[]>([
    { id: '1', timestamp: '00:25', timeSec: 25, text: 'Machine learning merevolusi AI industri modern.' },
    { id: '2', timestamp: '01:45', timeSec: 105, text: 'Supervised learning menggunakan dataset dengan ground-truth target label.' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Forum Q&A State
  const [discussions, setDiscussions] = useState([
    {
      id: 'd1',
      author: 'Dimas Anggara',
      time: '2 jam yang lalu',
      title: 'Apakah Gradient Descent selalu menjamin titik minimum global?',
      body: 'Untuk convex cost function seperti MSE pada linear regression, apakah mungkin terjebak di local minima?',
      upvotes: 8,
      replies: 3,
    },
    {
      id: 'd2',
      author: 'Larasati Putri',
      time: '1 hari yang lalu',
      title: 'Berapa nilai learning rate yang ideal untuk pemula?',
      body: 'Biasanya saya mulai dari alpha = 0.01, apakah ada aturan praktis lain?',
      upvotes: 12,
      replies: 5,
    },
  ]);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '' });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // AI Coach Chat State
  const [coachMessages, setCoachMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([
    {
      role: 'assistant',
      content:
        'Halo! Saya **Employr Coach** (Asisten Belajarmu). Ada konsep di video ini yang ingin saya rangkum, sederhanakan, atau berikan contoh kasus nyata di industri?',
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);

  // Quiz Engine State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Completed Lessons State
  const [completedLessons, setCompletedLessons] = useState<string[]>(['les-1-1']);

  // Find active lesson and surrounding lessons
  const allLessons: Lesson[] = [];
  course?.syllabus.forEach((mod) => {
    mod.lessons.forEach((l) => allLessons.push(l));
  });

  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  useEffect(() => {
    if (currentLesson?.type !== 'video' && activeTab === 'transcript') {
      setActiveTab('notes');
    }
  }, [lessonId, currentLesson?.type]);

  // Video Time Update Listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipTime = (delta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Add Note with Current Timestamp
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const timeFormatted = formatTime(currentTime);
    setNotes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        timestamp: timeFormatted,
        timeSec: Math.floor(currentTime),
        text: newNoteText.trim(),
      },
    ]);
    setNewNoteText('');
  };

  // Handle AI Coach Actions
  const sendCoachPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    setCoachMessages((prev) => [...prev, { role: 'user', content: promptText }]);
    setCoachInput('');
    setIsCoachThinking(true);

    setTimeout(() => {
      let response = '';
      if (promptText.toLowerCase().includes('rangkum')) {
        response = `📌 **Rangkuman 3 Poin Kunci Materi Ini:**\n1. **Definisi Supervised Learning**: Model belajar dari data masa lalu yang memiliki input ($x$) dan label target pasti ($y$).\n2. **Linear Regression**: Mencari bobot $w$ dan bias $b$ terbaik dengan meminimalkan Mean Squared Error.\n3. **Gradient Descent**: Algoritma optimasi yang memperbarui nilai parameter bertahap menuju lembah kesalahan minimum.`;
      } else if (promptText.toLowerCase().includes('contoh') || promptText.toLowerCase().includes('industri')) {
        response = `🏢 **Contoh Penerapan Nyata di Industri Indonesia:**\n* **Gojek / Grab**: Memprediksi estimasi waktu tiba (ETA) dan tarif dinamis berdasarkan jarak dan histori cuaca.\n* **Bibit / Dana**: Analisis profil risiko nasabah dan deteksi dini transaksi mencurigakan (Fraud Detection).`;
      } else if (promptText.toLowerCase().includes('sederhanakan')) {
        response = `💡 **Analogi Sederhana:**\nBayangkan kamu sedang belajar memanah. Setiap kali panahmu meleset ke kiri (ada *error*), otakmu secara otomatis menggeser bidikan sedikit ke kanan di lemparan berikutnya. Proses penyesuaian sedikit demi sedikit ini persis seperti cara kerja **Gradient Descent**!`;
      } else {
        response = `Pertanyaan bagus! Dalam konteks ${course?.title || 'kursus ini'}, konsep tersebut berfokus pada optimasi parameter data untuk menghasilkan prediksi yang memiliki tingkat generalisasi tinggi pada data baru.`;
      }

      setCoachMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsCoachThinking(false);
    }, 900);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    if (!currentLesson.quizQuestions) return;
    let correctCount = 0;
    currentLesson.quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / currentLesson.quizQuestions.length) * 100);
    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= 80) {
      if (!completedLessons.includes(currentLesson.id)) {
        setCompletedLessons((prev) => [...prev, currentLesson.id]);
      }
    }
  };

  const markCompletedAndNext = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
    }
    if (nextLesson) {
      router.push(`/kursus/${slug}/belajar/${nextLesson.id}`);
    }
  };

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-xs font-bold text-slate-400">Materi tidak ditemukan.</p>
      </div>
    );
  }

  const completionPercentage = Math.round((completedLessons.length / allLessons.length) * 100);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Classroom Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/kursus/${slug}`}
            className="p-1.5 rounded-[8px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Kembali ke Silabus"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
              {currentLesson.title}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">{course.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Progress Tracker */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {completionPercentage}% Selesai
            </span>
          </div>

          {/* Mark Complete Button */}
          <Button
            size="sm"
            onClick={markCompletedAndNext}
            className="h-8 px-3 text-caption font-bold gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Selesai & Lanjut</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-[8px] bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="Daftar Modul"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Classroom Split Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Video/Reading + Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-slate-900/50">
          {/* 1. Main Media Area */}
          <div className="w-full bg-black flex items-center justify-center relative">
            {currentLesson.type === 'video' ? (
              <div className="w-full max-h-[72vh] aspect-video relative group bg-black">
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  poster={currentLesson.videoPoster}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (!completedLessons.includes(currentLesson.id)) {
                      setCompletedLessons((prev) => [...prev, currentLesson.id]);
                    }
                  }}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Custom Video Control Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                  {/* Progress Seek Bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => seekVideo(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cobalt-500"
                  />

                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={togglePlay}
                        className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                      </button>

                      <button
                        onClick={() => skipTime(-10)}
                        className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
                        title="Mundur 10 detik"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => skipTime(10)}
                        className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
                        title="Maju 10 detik"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <span className="font-mono text-caption text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration || currentLesson.durationSeconds || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Playback Speed Picker */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-caption font-bold cursor-pointer"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-[8px] py-1 shadow-xl z-50">
                            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => changeSpeed(s)}
                                className={cn(
                                  'w-full px-4 py-1 text-left text-xs font-bold hover:bg-slate-800 transition',
                                  playbackSpeed === s ? 'text-cobalt-500' : 'text-slate-300'
                                )}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentLesson.type === 'reading' ? (
              <div className="w-full max-w-4xl mx-auto p-5 sm:p-8 bg-slate-950 text-slate-100 min-h-[400px] border border-slate-800 shadow-md rounded-[10px] my-4 sm:my-6">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FileText className="w-4 h-4 text-cobalt-400" />
                    <span className="font-semibold text-slate-300">Modul Bacaan &amp; Formula Matematika</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-[6px] border border-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {currentLesson.duration}
                  </span>
                </div>
                <MarkdownContent content={currentLesson.readingContent || ''} />
              </div>
            ) : (
              /* Quiz Engine Interface */
              <div className="w-full p-5 sm:p-6 bg-slate-950 text-slate-100 min-h-[400px] rounded-[10px] my-4 sm:my-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <h2 className="text-xs sm:text-sm font-bold text-white">Kuis Evaluasi Pemahaman</h2>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                    Passing Grade: 80%
                  </span>
                </div>

                {isQuizSubmitted && (
                  <div
                    className={cn(
                      'p-3.5 rounded-[10px] border flex items-center justify-between',
                      quizScore >= 80
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-800 text-rose-300'
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                        {quizScore >= 80 ? (
                          <>
                            <Award className="w-4 h-4 text-emerald-400" />
                            <span>SELAMAT, KAMU LULUS!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>BELUM MENCAPAI TARGET (80%)</span>
                          </>
                        )}
                      </p>
                      <p className="text-caption opacity-90">
                        Skor kamu: <strong>{quizScore}%</strong>. {quizScore >= 80 ? 'Materi ini telah ditandai selesai.' : 'Silakan pelajari kembali materi dan coba lagi.'}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="text-caption"
                    >
                      Ulangi Kuis
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {currentLesson.quizQuestions?.map((q, qIndex) => (
                    <div key={q.id} className="space-y-2.5 p-3.5 rounded-[10px] bg-slate-900/80 border border-slate-800">
                      <p className="text-xs font-bold text-white leading-relaxed">
                        {qIndex + 1}. {q.question}
                      </p>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          const isCorrect = q.correctAnswerIndex === optIdx;

                          let optionClass = 'border-slate-800 hover:bg-slate-800/60 text-slate-300';
                          if (isQuizSubmitted) {
                            if (isCorrect) optionClass = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold';
                            else if (isSelected && !isCorrect) optionClass = 'border-rose-500 bg-rose-950/60 text-rose-200';
                          } else if (isSelected) {
                            optionClass = 'border-cobalt-500 bg-cobalt-500/20 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isQuizSubmitted}
                              onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={cn(
                                'w-full p-2.5 rounded-[8px] border text-left text-xs transition flex items-center gap-2.5 cursor-pointer',
                                optionClass
                              )}
                            >
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px]',
                                  isSelected ? 'border-cobalt-500 bg-cobalt-500 text-white' : 'border-slate-600'
                                )}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isQuizSubmitted && (
                        <div className="p-2.5 rounded-[6px] bg-slate-950 border border-slate-800 text-caption text-slate-300 space-y-0.5">
                          <span className="font-bold text-blue-400">💡 Pembahasan:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!isQuizSubmitted && (
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length < (currentLesson.quizQuestions?.length || 0)}
                    className="w-full text-xs font-bold"
                  >
                    Kirim & Nilai Jawaban
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 2. Secondary Interactive Tab Nav (Transcript, Notes, Q&A, AI Coach) */}
          <div className="border-t border-slate-800 bg-slate-950">
            <div className="flex items-center gap-1 px-3 sm:px-4 border-b border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'transcript', label: 'Transkrip Sinkron', icon: FileText },
                { id: 'notes', label: `Catatan (${notes.length})`, icon: StickyNote },
                { id: 'discussion', label: `Diskusi & Q&A (${discussions.length})`, icon: MessageSquare },
                { id: 'coach', label: 'Employr Coach (AI)', icon: Bot, highlight: true },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer',
                      isActive
                        ? 'border-cobalt-500 text-cobalt-500 dark:text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200',
                      tab.highlight && !isActive && 'text-amber-400 hover:text-amber-300'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-3.5 sm:p-5 min-h-[250px] w-full">
              {/* TAB 1: SYNCHRONIZED TRANSCRIPT */}
              {activeTab === 'transcript' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-caption text-slate-400 mb-1.5">
                    <span>Klik pada baris kalimat untuk melompatkan posisi video:</span>
                    <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-Sync Aktif
                    </span>
                  </div>

                  {currentLesson.transcript && currentLesson.transcript.length > 0 ? (
                    <div className="space-y-1.5">
                      {currentLesson.transcript.map((cue, idx) => {
                        const isCurrentCue =
                          currentTime >= cue.time &&
                          (idx === currentLesson.transcript!.length - 1 || currentTime < currentLesson.transcript![idx + 1].time);

                        return (
                          <div
                            key={idx}
                            onClick={() => seekVideo(cue.time)}
                            className={cn(
                              'p-2.5 rounded-[8px] border transition flex items-start gap-2.5 cursor-pointer',
                              isCurrentCue
                                ? 'bg-blue-950/80 border-cobalt-500 text-white shadow-xs'
                                : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                            )}
                          >
                            <span className="font-mono text-[11px] font-bold text-cobalt-500 dark:text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded shrink-0">
                              {cue.timestamp}
                            </span>
                            <p className="text-xs leading-relaxed">{cue.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-caption text-slate-500 py-6 text-center">Transkrip tidak tersedia untuk tipe materi ini.</p>
                  )}
                </div>
              )}

              {/* TAB 2: TIMESTAMPED NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 rounded-[10px] border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                        Tambah Catatan Waktu Nyata
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900">
                        Waktu Video: {formatTime(currentTime)}
                      </span>
                    </div>

                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Ketik catatan penting dari video ini..."
                      rows={2}
                      className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-[8px] text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />

                    <Button size="sm" onClick={handleAddNote} className="text-caption">
                      Simpan Catatan
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 bg-slate-900 rounded-[8px] border border-slate-800 flex items-start justify-between gap-2.5"
                      >
                        <div className="space-y-0.5">
                          <button
                            onClick={() => seekVideo(note.timeSec)}
                            className="font-mono text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{note.timestamp}</span>
                          </button>
                          <p className="text-xs text-slate-200">{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCUSSION FORUM */}
              {activeTab === 'discussion' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">Diskusi Kelas & Tanya Jawab</h3>
                    <Button
                      size="sm"
                      onClick={() => setShowQuestionForm(!showQuestionForm)}
                      className="text-caption"
                    >
                      Tanya Pertanyaan
                    </Button>
                  </div>

                  {showQuestionForm && (
                    <div className="p-3.5 bg-slate-900 rounded-[10px] border border-slate-800 space-y-2.5">
                      <input
                        type="text"
                        placeholder="Judul pertanyaan..."
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-[6px] text-white"
                      />
                      <textarea
                        placeholder="Detail pertanyaan..."
                        rows={3}
                        value={newQuestion.body}
                        onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-[6px] text-white"
                      />
                      <Button
                        size="sm"
                        variant="brand"
                        onClick={() => {
                          if (newQuestion.title && newQuestion.body) {
                            setDiscussions([
                              {
                                id: String(Date.now()),
                                author: 'Ahmad Kasyaf (Kamu)',
                                time: 'Baru saja',
                                title: newQuestion.title,
                                body: newQuestion.body,
                                upvotes: 1,
                                replies: 0,
                              },
                              ...discussions,
                            ]);
                            setNewQuestion({ title: '', body: '' });
                            setShowQuestionForm(false);
                          }
                        }}
                        className="text-caption"
                      >
                        Kirim ke Forum
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {discussions.map((d) => (
                      <div key={d.id} className="p-3 bg-slate-900/90 rounded-[10px] border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-caption text-slate-400">
                          <span className="font-bold text-slate-300">{d.author}</span>
                          <span>{d.time}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{d.title}</h4>
                        <p className="text-xs text-slate-300">{d.body}</p>
                        <div className="flex items-center gap-3 pt-1 text-caption text-slate-400">
                          <button className="flex items-center gap-1 hover:text-white transition cursor-pointer">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{d.upvotes} Upvotes</span>
                          </button>
                          <span>{d.replies} Jawaban</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EMPLOYR COACH (AI TUTOR) */}
              {activeTab === 'coach' && (
                <div className="space-y-3">
                  {/* Quick Action Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '📌 Rangkum Video Ini',
                      '💡 Sederhanakan Konsep Rumit',
                      '🏢 Berikan Contoh Kasus Industri',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendCoachPrompt(prompt)}
                        className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-caption font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>

                  {/* Message History */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar p-3 bg-slate-950 rounded-[10px] border border-slate-800">
                    {coachMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-2.5 rounded-[8px] text-xs leading-relaxed max-w-xl',
                          msg.role === 'assistant'
                            ? 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto'
                            : 'bg-cobalt-500 text-white ml-auto font-medium whitespace-pre-line'
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <MarkdownContent content={msg.content} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    ))}

                    {isCoachThinking && (
                      <div className="p-2.5 rounded-[8px] bg-slate-900 border border-slate-800 text-xs text-amber-400 mr-auto flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Employr Coach sedang menyusun penjelasan...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tanya konsep apa pun kepada AI Coach..."
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendCoachPrompt(coachInput);
                      }}
                      className="flex-1 p-2 text-xs bg-slate-900 border border-slate-800 rounded-[8px] text-white focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => sendCoachPrompt(coachInput)}
                      className="h-8 px-3"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Syllabus Drawer / Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white">Daftar Modul & Materi</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 space-y-3">
              {course.syllabus.map((mod) => (
                <div key={mod.id} className="space-y-1">
                  <div className="px-2 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Minggu {mod.weekNumber}: {mod.title}
                  </div>

                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isCurrent = lesson.id === lessonId;
                      const isDone = completedLessons.includes(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/kursus/${slug}/belajar/${lesson.id}`}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-[8px] text-xs transition border',
                            isCurrent
                              ? 'bg-cobalt-500 text-white border-cobalt-500 font-bold shadow-xs'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          )}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : lesson.type === 'video' ? (
                              <Play className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            ) : lesson.type === 'quiz' ? (
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {lesson.duration}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
