'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flag,
  RotateCcw,
  CreditCard,
  QrCode,
  Wallet,
  Check,
  Search,
  Filter,
  Lock,
  Unlock,
  Play,
  BarChart3,
  AlertCircle,
  ArrowRight,
  Download,
  Flame,
  Tag,
  ShieldCheck,
  Layers,
  Zap,
  X,
  FileCheck2,
  CircleDot,
  CheckSquare,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- DATA TYPES ---
export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'multiple-select';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options?: QuestionOption[]; // for multiple-choice or multiple-select
  correctAnswer: string | string[]; // string for mc/short, string[] for multi-select
  explanation: string;
  aiTip?: string;
}

export interface QuizPackage {
  id: string;
  title: string;
  category: 'BUMN & CPNS' | 'Tech & Coding' | 'Bahasa & TOEFL' | 'TPA & Logika';
  description: string;
  durationMinutes: number;
  questionCount: number;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit' | 'HOTS';
  isPremium: boolean;
  price: number; // 0 for free
  passingScore: number; // e.g. 70
  totalAttemptsCount: number;
  questions: Question[];
}

export interface UserQuizAttempt {
  packageId: string;
  status: 'belum_selesai' | 'selesai';
  score?: number;
  answers: Record<number, string | string[]>; // questionId -> user answer
  flaggedQuestions: number[]; // questionIds marked as ragu-ragu
  startedAt: string;
  completedAt?: string;
  timeSpentSeconds: number;
}

// --- SAMPLE QUIZ PACKAGES DATA ---
const sampleQuizPackages: QuizPackage[] = [
  {
    id: 'quiz-bumn-tkd-1',
    title: 'Simulasi TKD BUMN & Core Values AKHLAK 2026',
    category: 'BUMN & CPNS',
    description: 'Latihan soal standar BUMN terbaru mencakup Verbal, Numerik, Logika, dan Core Values AKHLAK BUMN.',
    durationMinutes: 15,
    questionCount: 5,
    difficulty: 'HOTS',
    isPremium: true,
    price: 29000,
    passingScore: 75,
    totalAttemptsCount: 1420,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Pilihlah padanan kata (analogi) yang paling tepat: MOBIL : BENSIN = MANUSIA : ...',
        options: [
          { id: 'A', text: 'Oksigen' },
          { id: 'B', text: 'Makanan' },
          { id: 'C', text: 'Air' },
          { id: 'D', text: 'Olahraga' },
          { id: 'E', text: 'Jantung' },
        ],
        correctAnswer: 'B',
        explanation: 'Mobil membutuhkan bahan bakar berupa BENSIN untuk dapat berjalan, sebagaimana Manusia membutuhkan bahan bakar berupa MAKANAN untuk energi hidup.',
        aiTip: 'Cari hubungan fungsional spesifik: [Objek] membutuhkan [Sumber Energi Utama].',
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Nilai dari 12,5% dari 640 adalah ...',
        options: [
          { id: 'A', text: '60' },
          { id: 'B', text: '70' },
          { id: 'C', text: '80' },
          { id: 'D', text: '90' },
          { id: 'E', text: '100' },
        ],
        correctAnswer: 'C',
        explanation: '12,5% sama dengan pecahan 1/8. Maka 1/8 x 640 = 80.',
        aiTip: 'Hafalkan pecahan istimewa: 12,5% = 1/8. 640 / 8 = 80 dengan sangat cepat!',
      },
      {
        id: 3,
        type: 'multiple-select',
        question: 'Pilihlah DUA prinsip utama yang termasuk dalam Core Values AKHLAK BUMN:',
        options: [
          { id: 'A', text: 'Amanah (Memegang teguh kepercayaan)' },
          { id: 'B', text: 'Individualis (Bekerja secara mandiri tanpa tim)' },
          { id: 'C', text: 'Harmonis (Saling peduli dan menghargai perbedaan)' },
          { id: 'D', text: 'Komersialisasi (Mengutamakan keuntungan probadi)' },
        ],
        correctAnswer: ['A', 'C'],
        explanation: 'Core Values AKHLAK BUMN adalah Amanah, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif.',
        aiTip: 'AKHLAK singkatan dari Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif.',
      },
      {
        id: 4,
        type: 'short-answer',
        question: 'Deret angka: 2, 4, 8, 16, 32, ... Berapakah angka berikutnya?',
        correctAnswer: '64',
        explanation: 'Pola deret angka adalah perkalian 2 berturut-turut: 2x2=4, 4x2=8, 8x2=16, 16x2=32, 32x2=64.',
        aiTip: 'Deret geometri rasio r = 2.',
      },
      {
        id: 5,
        type: 'multiple-choice',
        question: 'Sikap karyawan saat menghadapi perubahan teknologi sistem kerja di BUMN yang relevan dengan poin ADAPTIF adalah ...',
        options: [
          { id: 'A', text: 'Menolak karena sistem lama sudah nyaman' },
          { id: 'B', text: 'Proaktif mempelajari sistem baru dan terus berinovasi' },
          { id: 'C', text: 'Menunggu instruksi eksplisit tanpa inisiatif' },
          { id: 'D', text: 'Mengeluhkan kerumitan teknologi baru kepada rekan' },
        ],
        correctAnswer: 'B',
        explanation: 'Perilaku Adaptif mencakup cepat menyesuaikan diri untuk menjadi lebih baik, terus berinovasi, dan bertindak proaktif.',
        aiTip: 'Jawaban terbaik untuk tes kepribadian BUMN selalu mencerminkan inisiatif positif dan orientasi solusi.',
      },
    ],
  },
  {
    id: 'quiz-react-frontend-1',
    title: 'Frontend React.js & Modern JavaScript Assessment',
    category: 'Tech & Coding',
    description: 'Uji pemahaman Hook, State Management, Virtual DOM, dan ES6+ untuk persiapan technical interview.',
    durationMinutes: 20,
    questionCount: 4,
    difficulty: 'Sedang',
    isPremium: false, // FREE
    price: 0,
    passingScore: 70,
    totalAttemptsCount: 2890,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Hook manakah di React yang digunakan untuk menangani side-effects seperti data fetching dan event listener?',
        options: [
          { id: 'A', text: 'useState' },
          { id: 'B', text: 'useEffect' },
          { id: 'C', text: 'useContext' },
          { id: 'D', text: 'useMemo' },
        ],
        correctAnswer: 'B',
        explanation: 'useEffect dirancang khusus untuk mengelola efek samping (side effects) dalam komponen fungsional React.',
        aiTip: 'Ingat: useState untuk simpan data lokal, useEffect untuk interaksi eksternal/lifecycle.',
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Apa keluaran dari baris kode berikut? console.log(typeof NaN);',
        codeSnippet: `console.log(typeof NaN);`,
        options: [
          { id: 'A', text: '"number"' },
          { id: 'B', text: '"NaN"' },
          { id: 'C', text: '"undefined"' },
          { id: 'D', text: '"object"' },
        ],
        correctAnswer: 'A',
        explanation: 'Di JavaScript, NaN (Not-a-Number) secara teknis memiliki tipe data "number" menurut spesifikasi ECMAScript.',
        aiTip: 'Pertanyaan jebakan populer di interview JS! NaN singkatan Not a Number tapi tipenya number.',
      },
      {
        id: 3,
        type: 'short-answer',
        question: 'Tuliskan nama metode array JavaScript yang digunakan untuk menghasilkan array baru berukuran sama berdasarkan transformasi fungsi callback (contoh: arr.___()):',
        correctAnswer: 'map',
        explanation: 'Array.prototype.map() mengembalikan array baru yang merupakan hasil transformasi tiap elemen.',
        aiTip: 'Gunakan map() untuk merender list elemen JSX di React.',
      },
      {
        id: 4,
        type: 'multiple-select',
        question: 'Pilihlah pernyataan yang BENAR mengenai perbedaan antara Server Component dan Client Component di Next.js App Router:',
        options: [
          { id: 'A', text: 'Server Component secara default tidak mengirimkan bundle JavaScript ke client.' },
          { id: 'B', text: 'Client Component harus diawali dengan direktif "use client" di baris paling atas.' },
          { id: 'C', text: 'Server Component dapat menggunakan hook useState dan useEffect.' },
          { id: 'D', text: 'Client Component dapat mengakses variabel lingkungan rahasia server (tanpa NEXT_PUBLIC).' },
        ],
        correctAnswer: ['A', 'B'],
        explanation: 'Server Component bersifat nol JavaScript client-side bundle & Client Component butuh direktif "use client". Hook React seperti useState HANYA bisa di Client Component.',
        aiTip: 'Server Component = cepat & secure, Client Component = interaktif & React hooks.',
      },
    ],
  },
  {
    id: 'quiz-cpns-twk-1',
    title: 'SKD CPNS 2026 — Tes Wawasan Kebangsaan (TWK)',
    category: 'BUMN & CPNS',
    description: 'Latihan soal TWK mencakup Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, dan Nasionalisme.',
    durationMinutes: 15,
    questionCount: 4,
    difficulty: 'Sedang',
    isPremium: true,
    price: 19000,
    passingScore: 65,
    totalAttemptsCount: 3100,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Pengakuan persamaan derajat, hak, dan kewajiban antara sesama manusia merupakan cerminan dari sila Pancasila ke-...',
        options: [
          { id: 'A', text: 'Sila ke-1' },
          { id: 'B', text: 'Sila ke-2' },
          { id: 'C', text: 'Sila ke-3' },
          { id: 'D', text: 'Sila ke-4' },
          { id: 'E', text: 'Sila ke-5' },
        ],
        correctAnswer: 'B',
        explanation: 'Sila ke-2 (Kemanusiaan yang Adil dan Beradab) mengandung nilai kemanusiaan, kesetaraan hak, dan rasa empati sesama manusia.',
        aiTip: 'Sila 2 = Hubungan antar-manusia/HAM. Sila 5 = Keadilan sosial & kesejahteraan publik.',
      },
      {
        id: 2,
        type: 'short-answer',
        question: 'Sebutkan jumlah pasal dalam UUD 1945 setelah amandemen keempat (ketik angka saja):',
        correctAnswer: '73',
        explanation: 'Hasil amandemen UUD 1945 menghasilkan 73 pasal, 170 ayat, 3 pasal aturan peralihan, dan 2 pasal aturan tambahan.',
        aiTip: 'Ingat angka kunci UUD 1945 post-amandemen: 73 pasal.',
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Semboyan Bhinneka Tunggal Ika dipetik dari kitab kuno karangan Empu Tantular, yaitu Kitab ...',
        options: [
          { id: 'A', text: 'Negarakertagama' },
          { id: 'B', text: 'Sutasoma' },
          { id: 'C', text: 'Arjunawijaya' },
          { id: 'D', text: 'Pararaton' },
        ],
        correctAnswer: 'B',
        explanation: 'Frasa "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" terdapat dalam Kitab Sutasoma karya Empu Tantular pada zaman Majapahit.',
        aiTip: 'Sutasoma = Bhinneka Tunggal Ika, Negarakertagama = Mpu Prapanca (Istilah Pancasila).',
      },
      {
        id: 4,
        type: 'multiple-choice',
        question: 'Berdasarkan UUD 1945, kekuasaan kehakiman di Indonesia dilakukan oleh Mahkamah Agung dan ...',
        options: [
          { id: 'A', text: 'Mahkamah Konstitusi' },
          { id: 'B', text: 'Komisi Yudisial' },
          { id: 'C', text: 'Kejaksaan Agung' },
          { id: 'D', text: 'Dewan Perwakilan Rakyat' },
        ],
        correctAnswer: 'A',
        explanation: 'Pasal 24 Ayat (2) UUD 1945 menyatakan kekuasaan kehakiman dilakukan oleh MA dan badan peradilan di bawahnya serta oleh sebuah Mahkamah Konstitusi.',
        aiTip: 'Lembaga Yudisial pemegang kekuasaan kehakiman = MA & MK. KY bertugas mengawasi hakim.',
      },
    ],
  },
  {
    id: 'quiz-toefl-structure-1',
    title: 'TOEFL Structure & Written Expression Practice',
    category: 'Bahasa & TOEFL',
    description: 'Latihan soal Grammar, Subject-Verb Agreement, Inversion, dan Error Identification untuk skor TOEFL 550+.',
    durationMinutes: 10,
    questionCount: 3,
    difficulty: 'HOTS',
    isPremium: false,
    price: 0,
    passingScore: 80,
    totalAttemptsCount: 1980,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Pilihlah kata yang paling tepat untuk melengkapi kalimat: Neither the manager nor the employees ___ aware of the new policy.',
        options: [
          { id: 'A', text: 'was' },
          { id: 'B', text: 'were' },
          { id: 'C', text: 'is' },
          { id: 'D', text: 'be' },
        ],
        correctAnswer: 'B',
        explanation: 'Pada struktur "Neither ... nor ...", kata kerja (verb) mengikuti subjek yang terletak PALING DEKAT dengannya ("the employees" -> plural -> "were").',
        aiTip: 'Aturan Proximity: Subjek terdekat dengan verb menentukan singular/plural.',
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Pilihlah bentuk yang tepat: Hardly ___ finished his presentation when the power went out.',
        options: [
          { id: 'A', text: 'he had' },
          { id: 'B', text: 'had he' },
          { id: 'C', text: 'he has' },
          { id: 'D', text: 'did he' },
        ],
        correctAnswer: 'B',
        explanation: 'Keterangan negatif seperti "Hardly", "Seldom", "Never" di awal kalimat memerlukan pola inversi (Auxiliary Verb + Subject).',
        aiTip: 'Negative Inversion Formula: Hardly + Had + Subject + V3 + when...',
      },
      {
        id: 3,
        type: 'short-answer',
        question: 'Sebutkan kata sifat (adjective) dalam kalimat berikut: "She solved the difficult puzzle quickly."',
        correctAnswer: 'difficult',
        explanation: 'Kata "difficult" menerangkan kata benda "puzzle", sehingga berfungsi sebagai kata sifat (adjective). Sedangkan "quickly" adalah adverb.',
        aiTip: 'Adjective = menerangkan Noun (difficult puzzle). Adverb = menerangkan Verb (solved quickly).',
      },
    ],
  },
];

export const LatihanSoalView: React.FC = () => {
  // Navigation tabs state: 'catalog' | 'my-quizzes'
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'my-quizzes'>('catalog');

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User purchased/unlocked quiz package IDs
  const [unlockedQuizIds, setUnlockedQuizIds] = useState<string[]>(['quiz-react-frontend-1', 'quiz-toefl-structure-1']);

  // User Quiz Attempts History (packageId -> UserQuizAttempt)
  const [quizAttempts, setQuizAttempts] = useState<Record<string, UserQuizAttempt>>({});

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedQuizForPayment, setSelectedQuizForPayment] = useState<QuizPackage | null>(null);
  const [promoCode, setPromoCode] = useState<string>('CUTIPRO70');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'bca' | 'mandiri'>('qris');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Active Exam Simulation Engine State
  const [activeQuizPackage, setActiveQuizPackage] = useState<QuizPackage | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isExamFinished, setIsExamFinished] = useState<boolean>(false);
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState<boolean>(false);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  // Start a quiz test
  const handleStartQuiz = (quiz: QuizPackage) => {
    // Check if user owns it or if it is free
    if (quiz.isPremium && !unlockedQuizIds.includes(quiz.id)) {
      // Prompt payment checkout modal
      setSelectedQuizForPayment(quiz);
      setAppliedDiscount(0);
      setPaymentSuccess(false);
      setPaymentModalOpen(true);
      return;
    }

    // Initialize Exam State
    setActiveQuizPackage(quiz);
    setCurrentQuestionIdx(0);

    // Restore previous attempt if existing or reset
    const existingAttempt = quizAttempts[quiz.id];
    if (existingAttempt && existingAttempt.status === 'belum_selesai') {
      setUserAnswers(existingAttempt.answers);
      setFlaggedQuestions(existingAttempt.flaggedQuestions);
    } else {
      setUserAnswers({});
      setFlaggedQuestions([]);
    }

    setSecondsRemaining(quiz.durationMinutes * 60);
    setIsExamFinished(false);
  };

  // Toggle flag on current question
  const toggleFlagQuestion = (qId: number) => {
    setFlaggedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Update answer for current question
  const handleAnswerSelect = (qId: number, val: string | string[]) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Finish and Calculate Exam Score
  const handleFinishExam = useCallback(() => {
    if (!activeQuizPackage) return;

    let correctCount = 0;
    activeQuizPackage.questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (!userAns) return;

      if (q.type === 'multiple-select') {
        const correctArray = (q.correctAnswer as string[]).sort();
        const userArray = Array.isArray(userAns) ? userAns.sort() : [];
        if (JSON.stringify(correctArray) === JSON.stringify(userArray)) {
          correctCount++;
        }
      } else {
        if (
          String(userAns).trim().toLowerCase() ===
          String(q.correctAnswer).trim().toLowerCase()
        ) {
          correctCount++;
        }
      }
    });

    const calculatedScore = Math.round((correctCount / activeQuizPackage.questions.length) * 100);

    // Save Attempt Result
    const newAttempt: UserQuizAttempt = {
      packageId: activeQuizPackage.id,
      status: 'selesai',
      score: calculatedScore,
      answers: userAnswers,
      flaggedQuestions: flaggedQuestions,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: activeQuizPackage.durationMinutes * 60 - secondsRemaining,
    };

    setQuizAttempts((prev) => ({ ...prev, [activeQuizPackage.id]: newAttempt }));
    setIsExamFinished(true);
    setConfirmSubmitModalOpen(false);
  }, [activeQuizPackage, userAnswers, flaggedQuestions, secondsRemaining]);

  // Timer countdown effect during exam
  useEffect(() => {
    if (!activeQuizPackage || isExamFinished) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on time out
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuizPackage, isExamFinished, handleFinishExam]);

  // Process Checkout Payment
  const handleApplyCoupon = () => {
    if (promoCode.trim().toUpperCase() === 'CUTIPRO70') {
      setAppliedDiscount(0.7); // 70% off
    } else if (promoCode.trim().toUpperCase() === 'BUMN2026') {
      setAppliedDiscount(0.5); // 50% off
    } else {
      setAppliedDiscount(0);
    }
  };

  const handleExecutePayment = () => {
    if (!selectedQuizForPayment) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      // Unlock quiz
      setUnlockedQuizIds((prev) => [...prev, selectedQuizForPayment.id]);

      setTimeout(() => {
        setPaymentModalOpen(false);
        // Direct start exam
        handleStartQuiz(selectedQuizForPayment);
      }, 1200);
    }, 1500);
  };

  // Filtered Quiz Catalog
  const filteredCatalog = sampleQuizPackages.filter((quiz) => {
    const matchCategory =
      selectedCategory === 'Semua' || quiz.category === selectedCategory;
    const matchSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // User's My Quizzes List
  const myQuizzes = sampleQuizPackages.filter((quiz) => {
    return unlockedQuizIds.includes(quiz.id) || !quiz.isPremium;
  });

  // --- RENDER VIEW 1: ACTIVE EXAM SIMULATION INTERFACE ---
  if (activeQuizPackage && !isExamFinished) {
    const currentQ = activeQuizPackage.questions[currentQuestionIdx];
    const isCurrentFlagged = flaggedQuestions.includes(currentQ.id);
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
        {/* Exam Header */}
        <header className="bg-slate-950 border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-[#1738D1]/20 text-orange-400 border border-[#1738D1]/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-sm md:text-base text-white truncate max-w-xs md:max-w-md">
                {activeQuizPackage.title}
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">
                Soal {currentQuestionIdx + 1} dari {activeQuizPackage.questions.length} • {activeQuizPackage.category}
              </span>
            </div>
          </div>

          {/* Realtime Timer & Submit Button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[10px] border font-mono font-bold text-xs ${
                secondsRemaining < 180
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-amber-300'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Sisa Waktu: {formatTime(secondsRemaining)}</span>
            </div>

            <Button
              size="sm"
              onClick={() => setConfirmSubmitModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 rounded-[10px] cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Selesaikan Test</span>
            </Button>
          </div>
        </header>

        {/* Exam Body Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Box (Left - 3 Cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between bg-slate-950/70 rounded-[10px] border border-slate-800 p-6 md:p-8 shadow-2xl relative">
            <div className="space-y-6">
              {/* Question Header & Flag Toggle */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="px-3 py-1 rounded-[10px] text-xs font-black bg-orange-950 text-orange-300 border border-orange-800">
                  Nomor {currentQuestionIdx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => toggleFlagQuestion(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] font-extrabold text-xs transition cursor-pointer border ${
                    isCurrentFlagged
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-slate-950' : ''}`} />
                  <span>{isCurrentFlagged ? 'Ragu-Ragu (Tandai)' : 'Tandai Ragu-Ragu'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </p>

                {/* Optional Code Snippet */}
                {currentQ.codeSnippet && (
                  <pre className="p-4 rounded-[10px] bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* Input Options based on Type */}
              <div className="pt-2">
                {/* 1. Multiple Choice Options */}
                {currentQ.type === 'multiple-choice' && currentQ.options && (
                  <div className="space-y-3">
                    {currentQ.options.map((opt) => {
                      const isSelected = userAnswers[currentQ.id] === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleAnswerSelect(currentQ.id, opt.id)}
                          className={`p-4 rounded-[10px] border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#1738D1]/20 border-[#1738D1] text-white ring-2 ring-[#1738D1]/40 shadow-lg'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-[10px] font-black text-xs flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#1738D1] text-white border-orange-400'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <span className="text-sm font-semibold">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Multiple Select (Checkbox) Options */}
                {currentQ.type === 'multiple-select' && currentQ.options && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" />
                      <span>Pilihlah lebih dari satu jawaban yang benar:</span>
                    </p>
                    {currentQ.options.map((opt) => {
                      const currentSelected = Array.isArray(userAnswers[currentQ.id])
                        ? (userAnswers[currentQ.id] as string[])
                        : [];
                      const isChecked = currentSelected.includes(opt.id);

                      const handleCheckboxToggle = () => {
                        const newSelection = isChecked
                          ? currentSelected.filter((item) => item !== opt.id)
                          : [...currentSelected, opt.id];
                        handleAnswerSelect(currentQ.id, newSelection);
                      };

                      return (
                        <div
                          key={opt.id}
                          onClick={handleCheckboxToggle}
                          className={`p-4 rounded-[10px] border transition-all cursor-pointer flex items-center gap-3 ${
                            isChecked
                              ? 'bg-[#1738D1]/20 border-[#1738D1] text-white ring-2 ring-[#1738D1]/40'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 border ${
                              isChecked
                                ? 'bg-[#1738D1] border-orange-400 text-white'
                                : 'bg-slate-800 border-slate-700 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Short Answer / Isian Singkat */}
                {currentQ.type === 'short-answer' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">
                      Tuliskan Jawaban Anda Secara Tepat:
                    </label>
                    <input
                      type="text"
                      value={String(userAnswers[currentQ.id] || '')}
                      onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
                      placeholder="Masukkan teks/angka jawaban..."
                      className="w-full px-4 py-3.5 rounded-[10px] bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/30"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-6">
              <Button
                variant="outline"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-[10px] cursor-pointer text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Sebelumnya</span>
              </Button>

              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                {answeredCount} dari {activeQuizPackage.questions.length} Soal Terjawab
              </span>

              {currentQuestionIdx < activeQuizPackage.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                  className="bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs px-5 rounded-[10px] cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => setConfirmSubmitModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 rounded-[10px] cursor-pointer shadow-md"
                >
                  <span>Selesai &amp; Kirim</span>
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation Palette Grid (Right Sidebar - 1 Col) */}
          <div className="bg-slate-950/70 rounded-[10px] border border-slate-800 p-5 space-y-5 h-fit">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Navigasi Soal</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik nomor soal untuk melompat langsung.
              </p>
            </div>

            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold border-y border-slate-800 py-3">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-[10px] bg-emerald-500 shrink-0" />
                <span>Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-[10px] bg-amber-500 shrink-0" />
                <span>Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-[10px] bg-slate-800 shrink-0 border border-slate-700" />
                <span>Kosong</span>
              </div>
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-5 gap-2">
              {activeQuizPackage.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                const isFlagged = flaggedQuestions.includes(q.id);
                const isCurrent = idx === currentQuestionIdx;

                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isFlagged) {
                  btnStyle = 'bg-amber-500 text-slate-950 font-black border-amber-400';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-600 text-white font-black border-emerald-400';
                }

                if (isCurrent) {
                  btnStyle += ' ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-950';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-10 rounded-[10px] border text-xs flex items-center justify-center transition cursor-pointer ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setConfirmSubmitModalOpen(true)}
              className="w-full py-2.5 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-extrabold rounded-[10px] cursor-pointer"
            >
              Cek Rincian Jawaban
            </Button>
          </div>
        </div>

        {/* Confirmation Submit Modal */}
        {confirmSubmitModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[10px] p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-black text-white">Konfirmasi Selesai Ujian</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Anda telah menjawab <span className="font-extrabold text-white">{answeredCount}</span> dari{' '}
                <span className="font-extrabold text-white">{activeQuizPackage.questions.length}</span> soal.
                {flaggedQuestions.length > 0 && (
                  <span className="block mt-1 text-amber-400 font-bold">
                    Masih ada {flaggedQuestions.length} soal dengan status Ragu-Ragu.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmSubmitModalOpen(false)}
                  className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 rounded-[10px] text-xs font-bold cursor-pointer"
                >
                  Kembali Periksa
                </Button>
                <Button
                  onClick={handleFinishExam}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-xs font-extrabold cursor-pointer"
                >
                  Kirim Jawaban
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER VIEW 2: COMPREHENSIVE EXAM RESULT & AI PEMBAHASAN REVIEW ---
  if (activeQuizPackage && isExamFinished) {
    const attempt = quizAttempts[activeQuizPackage.id];
    const score = attempt?.score ?? 0;
    const isPassed = score >= activeQuizPackage.passingScore;

    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
        {/* Score Header Card */}
        <div
          className={`p-6 md:p-8 rounded-[10px] border shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${
            isPassed
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-navy-950 border-emerald-500/40 text-white'
              : 'bg-gradient-to-br from-amber-950 via-slate-900 to-rose-950 border-amber-500/40 text-white'
          }`}
        >
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-extrabold uppercase tracking-wider bg-white/10 border border-white/20">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Hasil Latihan Soal</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black">
              {isPassed ? 'Selamat! Anda Lulus Passing Grade' : 'Tetap Semangat! Tingkatkan Latihan'}
            </h2>

            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Target Passing Grade: <span className="font-bold text-white">{activeQuizPackage.passingScore}%</span>.{' '}
              {isPassed
                ? 'Kualifikasi Anda sudah memenuhi standar seleksi!'
                : 'Cermati pembahasan di bawah untuk memperbaiki konsep yang masih keliru.'}
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-[10px] bg-slate-950/60 border border-white/10 shrink-0 z-10 min-w-[160px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              SKOR AKHIR
            </span>
            <span className={`text-4xl md:text-5xl font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 mt-1 font-bold">dari 100</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={() => {
              setActiveQuizPackage(null);
              setIsExamFinished(false);
            }}
            variant="outline"
            className="rounded-[10px] font-bold text-xs cursor-pointer border-slate-300 dark:border-slate-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Kembali ke Katalog Soal</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleStartQuiz(activeQuizPackage)}
              className="bg-[#1738D1] hover:bg-[#132EA8] text-white rounded-[10px] font-bold text-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Coba Latihan Lagi</span>
            </Button>
          </div>
        </div>

        {/* Detailed Question Reviews with AI Pembahasan */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <span>Pembahasan Lengkap &amp; Kunci Jawaban</span>
          </h3>

          <div className="space-y-4">
            {activeQuizPackage.questions.map((q, idx) => {
              const userAns = attempt?.answers[q.id];
              let isUserCorrect = false;

              if (q.type === 'multiple-select') {
                const correctArr = (q.correctAnswer as string[]).sort();
                const userArr = Array.isArray(userAns) ? userAns.sort() : [];
                isUserCorrect = JSON.stringify(correctArr) === JSON.stringify(userArr);
              } else {
                isUserCorrect =
                  String(userAns || '').trim().toLowerCase() ===
                  String(q.correctAnswer).trim().toLowerCase();
              }

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                      Soal #{idx + 1}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                        isUserCorrect
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isUserCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Jawaban Benar (+20 Poin)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Jawaban Salah / Kurang Tepat</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Question Text */}
                  <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>

                  {/* Answer Comparison */}
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Jawaban Anda:</span>
                      <span
                        className={`font-mono font-black ${
                          isUserCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {Array.isArray(userAns) ? userAns.join(', ') : userAns || '(Tidak Dijawab)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-500">Kunci Jawaban Benar:</span>
                      <span className="font-mono font-black text-orange-600 dark:text-orange-400">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="p-4 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/60 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-orange-900 dark:text-orange-300 font-extrabold">
                      <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span>Pembahasan Soal:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {q.explanation}
                    </p>

                    {q.aiTip && (
                      <div className="mt-2 pt-2 border-t border-orange-200/60 dark:border-orange-800/60 flex items-start gap-2 text-amber-900 dark:text-amber-300 font-semibold">
                        <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>Saran Strategis: {q.aiTip}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN LATIHAN SOAL DASHBOARD (CATALOG & MY QUIZZES) ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[10px] bg-navy-700 p-6 md:p-8 text-white shadow-xl border border-navy-800">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#1738D1]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] text-xs font-extrabold uppercase tracking-wider bg-[#1738D1] text-white shadow-md">
            <GraduationCap className="w-4 h-4 fill-current" />
            <span>Bank Soal &amp; Try Out Interaktif</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            Latihan Soal BUMN, CPNS, &amp; Tech Interview
          </h1>

          <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
            Asah kesiapan ujian karir Anda dengan ribuan soal standar resmi, timer real-time, skor passing grade, serta pembahasan pintar.
          </p>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-[#1738D1] text-white shadow-md shadow-[#1738D1]/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Daftar Latihan Soal (Katalog)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my-quizzes')}
            className={`px-4 py-2.5 rounded-[10px] text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'my-quizzes'
                ? 'bg-[#1738D1] text-white shadow-md shadow-[#1738D1]/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Latihan Soal Saya</span>
            <span className="px-1.5 py-0.5 rounded-[10px] text-[10px] bg-white/20 font-black">
              {myQuizzes.length}
            </span>
          </button>
        </div>
      </div>

      {/* --- SUB TAB 1: DAFTAR LATIHAN SOAL (CATALOG) --- */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik latihan (misal: BUMN, React, CPNS, TOEFL)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1738D1] shadow-xs"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {['Semua', 'BUMN & CPNS', 'Tech & Coding', 'Bahasa & TOEFL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-[10px] text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-[#1738D1]'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((quiz) => {
              const isUnlocked = unlockedQuizIds.includes(quiz.id) || !quiz.isPremium;
              const hasAttempted = quizAttempts[quiz.id]?.status === 'selesai';
              const lastScore = quizAttempts[quiz.id]?.score;

              return (
                <div
                  key={quiz.id}
                  className="p-6 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-extrabold uppercase tracking-wide bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300 border border-navy-200 dark:border-navy-800">
                        {quiz.category}
                      </span>

                      {quiz.isPremium ? (
                        <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Rp {quiz.price.toLocaleString('id-ID')}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          <span>GRATIS</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>

                    {/* Stats Specs */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400" />
                        <span>{quiz.durationMinutes} Mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400" />
                        <span>{quiz.questionCount} Soal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>{quiz.difficulty}</span>
                      </div>
                    </div>

                    {/* Previous Score Status if Attempted */}
                    {hasAttempted && (
                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">Skor Terakhir:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {lastScore} / 100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Action Button */}
                  <Button
                    onClick={() => handleStartQuiz(quiz)}
                    className={`w-full py-2.5 rounded-[10px] font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isUnlocked
                        ? 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-xs'
                        : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Kerjakan Soal</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Beli &amp; Buka Akses (Rp {quiz.price.toLocaleString('id-ID')})</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUB TAB 2: LATIHAN SOAL SAYA (MY QUIZZES) --- */}
      {activeSubTab === 'my-quizzes' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Daftar Soal Tersimpan &amp; Riwayat Nilai
            </h3>
            <span className="text-xs text-slate-500">
              Total {myQuizzes.length} Paket Soal Terbuka
            </span>
          </div>

          <div className="space-y-4">
            {myQuizzes.map((quiz) => {
              const attempt = quizAttempts[quiz.id];
              const isCompleted = attempt?.status === 'selesai';

              return (
                <div
                  key={quiz.id}
                  className="p-5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300">
                        {quiz.category}
                      </span>
                      {isCompleted ? (
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                          Selesai • Skor {attempt?.score}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          Belum Dikerjakan
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {quiz.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span>{quiz.durationMinutes} Menit</span>
                      <span>•</span>
                      <span>{quiz.questionCount} Soal</span>
                      <span>•</span>
                      <span>Passing Grade {quiz.passingScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => handleStartQuiz(quiz)}
                      className="bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs px-4 rounded-[10px] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      <span>{isCompleted ? 'Coba Ulangi' : 'Kerjakan Sekarang'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL CHECKOUT FLOW --- */}
      {paymentModalOpen && selectedQuizForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            {/* Payment Header */}
            <div className="p-5 bg-navy-700 text-white flex items-center justify-between border-b border-navy-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pembayaran Aman CUTI</span>
                </span>
                <h3 className="font-extrabold text-lg text-white">Pembelian Paket Soal</h3>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Body */}
            <div className="p-6 space-y-5 bg-white dark:bg-slate-900 flex-1 overflow-y-auto no-scrollbar">
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-300 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Pembayaran Berhasil!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akses paket soal <span className="font-bold text-navy-700 dark:text-navy-300">{selectedQuizForPayment.title}</span> telah aktif secara instan.
                  </p>
                </div>
              ) : (
                <>
                  {/* Item Detail */}
                  <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-orange-600 uppercase">
                      {selectedQuizForPayment.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedQuizForPayment.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Termasuk: {selectedQuizForPayment.questionCount} Soal HOTS + Timer + Pembahasan Lengkap
                    </p>
                  </div>

                  {/* Coupon Code Entry */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kode Diskon Promo:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Masukkan kode promo..."
                          className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleApplyCoupon}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-[10px] cursor-pointer"
                      >
                        Pakai
                      </Button>
                    </div>
                    {appliedDiscount > 0 && (
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Kode promo berhasil! Diskon {appliedDiscount * 100}% diterapkan.</span>
                      </p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Pilih Metode Pembayaran:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'qris', label: 'QRIS Instant Scan', icon: QrCode },
                        { id: 'gopay', label: 'GoPay / E-Wallet', icon: Wallet },
                        { id: 'bca', label: 'BCA Virtual Account', icon: CreditCard },
                        { id: 'mandiri', label: 'Mandiri Livin', icon: CreditCard },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as any)}
                            className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50 dark:bg-orange-950 border-[#1738D1] text-orange-700 dark:text-orange-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="truncate">{pm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Calculation Summary */}
                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Harga Asli:</span>
                      <span>Rp {selectedQuizForPayment.price.toLocaleString('id-ID')}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Diskon ({appliedDiscount * 100}%):</span>
                        <span>- Rp {(selectedQuizForPayment.price * appliedDiscount).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      <span>Total Pembayaran:</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        Rp {(selectedQuizForPayment.price * (1 - appliedDiscount)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <Button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3 h-auto rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] active:scale-[0.98] text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 border-0"
                  >
                    {isProcessingPayment ? (
                      <span>Memproses Pembayaran...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>Bayar &amp; Buka Akses Sekarang</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
