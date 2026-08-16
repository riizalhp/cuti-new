'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ArrowRight,
  Target,
  FileCheck,
  AlignLeft,
  Zap,
  MessageSquare,
} from 'lucide-react';

export interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionTitle: string;
  currentContent?: string;
  onApplyContent: (newContent: string, feedbackMsg: string) => void;
  targetJobTitle?: string;
}

export type AiGoal = 'auto' | 'impact' | 'ats' | 'concise';
export type AiFormula = 'auto' | 'star' | 'car' | 'par' | 'xyz' | 'sar' | 'metrics' | 'ats-keywords';

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  sectionKey,
  sectionTitle,
  currentContent = '',
  onApplyContent,
  targetJobTitle = 'Professional',
}) => {
  const [goal, setGoal] = useState<AiGoal>('auto');
  const [formula, setFormula] = useState<AiFormula>('auto');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'interview' | 'loading' | 'results' | 'empty' | 'error'>('select');
  const [userRawInput, setUserRawInput] = useState(currentContent);

  // Interview state
  const [interviewQuestionIdx, setInterviewQuestionIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ [key: string]: string }>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');

  // Generated options state
  const [generatedOptions, setGeneratedOptions] = useState<
    Array<{ id: string; label: string; formulaTag: string; text: string }>
  >([]);

  // Reset drawer state when opened with new content
  useEffect(() => {
    if (isOpen) {
      setUserRawInput(currentContent);
      if (!currentContent.trim()) {
        setStep('empty');
      } else {
        setStep('select');
      }
      setGoal('auto');
      setFormula('auto');
      setInterviewQuestionIdx(0);
      setInterviewAnswers({});
      setCurrentAnswerInput('');
    }
  }, [isOpen, currentContent]);

  if (!isOpen) return null;

  // Questions for AI Interview if data is missing metrics/details
  const interviewQuestions = [
    {
      id: 'q1',
      question: `Berapa banyak volume atau skala kerja yang kamu tangani? (Misal: 20-30 konten/bulan, 50+ pengguna, dsb.)`,
      placeholder: 'Contoh: 20-30 konten per bulan',
    },
    {
      id: 'q2',
      question: `Apa hasil akhir atau dampaknya? (Misal: Peningkatan engagement 25%, efisiensi waktu 40%, dsb.)`,
      placeholder: 'Contoh: Engagement naik 25% dan 10k follower baru',
    },
  ];

  const handleStartAiProcess = () => {
    // If input is very brief e.g. < 50 chars and missing numbers, trigger AI Interview first
    const hasNumbers = /\d+/.test(userRawInput);
    if (!hasNumbers && userRawInput.length < 50 && interviewQuestionIdx === 0 && Object.keys(interviewAnswers).length === 0) {
      setStep('interview');
      return;
    }

    setStep('loading');
    setTimeout(() => {
      // Generate 3 contextual options based on user input & strategy
      const baseText = userRawInput.trim() || 'Mengelola pengembangan dan operasional proyek secara efektif.';
      const ans1 = interviewAnswers['q1'] ? ` (${interviewAnswers['q1']})` : '';
      const ans2 = interviewAnswers['q2'] ? ` yang berdampak pada ${interviewAnswers['q2']}` : '';

      const options = [
        {
          id: 'opt-1',
          label: 'Option 1 — CAR (Challenge, Action, Result)',
          formulaTag: 'CAR + Metrics',
          text: `Meningkatkan efisiensi kerja sebesar 40% melalui penyusunan dan pengelolaan ${baseText.toLowerCase()}${ans1}${ans2}.`,
        },
        {
          id: 'opt-2',
          label: 'Option 2 — XYZ (Result, Measurement, Action)',
          formulaTag: 'XYZ Formula',
          text: `Mencapai peningkatan performa 35% dalam 4 bulan dengan mengoptimalkan ${baseText.toLowerCase()}${ans1}.`,
        },
        {
          id: 'opt-3',
          label: 'Option 3 — ATS Optimized',
          formulaTag: 'ATS Keywords + Metrics',
          text: `Mengelola ${targetJobTitle.toLowerCase()} workflows, memimpin eksekusi strategi terukur${ans1}, dan mengoptimalkan hasil tim${ans2}.`,
        },
      ];

      setGeneratedOptions(options);
      setStep('results');
    }, 1800);
  };

  const handleAnswerInterviewNext = () => {
    if (currentAnswerInput.trim()) {
      setInterviewAnswers((prev) => ({
        ...prev,
        [interviewQuestions[interviewQuestionIdx].id]: currentAnswerInput.trim(),
      }));
    }
    setCurrentAnswerInput('');

    if (interviewQuestionIdx < interviewQuestions.length - 1) {
      setInterviewQuestionIdx((prev) => prev + 1);
    } else {
      // Done interview, proceed to generate
      handleStartAiProcess();
    }
  };

  const handleSelectOption = (text: string) => {
    const feedback = `Ditambahkan: hasil terukur, kata kerja aksi, dan keyword ATS relevan.`;
    onApplyContent(text, feedback);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-in fade-in"
    >
      {/* Right Drawer Panel (Desktop) / Bottom Sheet (Mobile) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-md md:max-w-lg h-full max-h-[92vh] sm:max-h-full bottom-0 rounded-t-[10px] sm:rounded-none bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 cursor-default"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/30">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bantu Tulis dengan AI</span>
                <span className="px-2 py-0.5 rounded-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold border border-purple-200 dark:border-purple-700">
                  Contextual
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px]">
                Konteks: {sectionTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup AI Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 no-scrollbar">
          {/* STEP: EMPTY STATE */}
          {step === 'empty' && (
            <div className="space-y-4 text-center py-8 px-2">
              <div className="w-14 h-14 rounded-[10px] bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Ceritakan Pengalamanmu
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Tidak perlu menulis dengan format CV kaku. Cukup ceritakan saja dengan bahasa sehari-hari secara bebas.
                </p>
              </div>

              <textarea
                rows={4}
                value={userRawInput}
                onChange={(e) => setUserRawInput(e.target.value)}
                placeholder="Contoh: Saya kemarin bikin program referral pelanggan di kampus terus yang ikut sekitar 100 orang dan jualan produk naik 30%..."
                className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />

              <button
                type="button"
                disabled={!userRawInput.trim()}
                onClick={() => setStep('select')}
                className="w-full py-3 px-4 rounded-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Mulai dengan AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP: SELECT STRATEGY & GOALS */}
          {step === 'select' && (
            <div className="space-y-5">
              {/* Input Draft Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Teks yang Sedang Ditulis</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Terkoneksi Editor</span>
                </label>
                <textarea
                  rows={3}
                  value={userRawInput}
                  onChange={(e) => setUserRawInput(e.target.value)}
                  placeholder="Ketik poin atau pengalaman sederhana kamu di sini..."
                  className="w-full p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              {/* Goal Selection Header */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Pilih Tujuan Penulisan
                </h4>

                {/* Option: AI Recommendation (DEFAULT) */}
                <div
                  onClick={() => setGoal('auto')}
                  className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-start gap-3 ${
                    goal === 'auto'
                      ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 dark:border-purple-600 ring-2 ring-purple-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 fill-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rekomendasi AI</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white">
                          Default
                        </span>
                      </span>
                      {goal === 'auto' && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      AI menganalisis posisi dan memilih kombinasi formula terbaik secara otomatis.
                    </p>
                  </div>
                </div>

                {/* Radio Goals */}
                <div className="space-y-2 pt-1">
                  {/* Goal 1: Impact */}
                  <label
                    onClick={() => setGoal('impact')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                      goal === 'impact'
                        ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span>Fokus Pencapaian &amp; Dampak Terukur</span>
                    </div>
                    <input type="radio" checked={goal === 'impact'} onChange={() => setGoal('impact')} className="accent-purple-600" />
                  </label>

                  {/* Goal 2: ATS */}
                  <label
                    onClick={() => setGoal('ats')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                      goal === 'ats'
                        ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-purple-500" />
                      <span>Fokus Optimalisasi Keyword ATS</span>
                    </div>
                    <input type="radio" checked={goal === 'ats'} onChange={() => setGoal('ats')} className="accent-purple-600" />
                  </label>

                  {/* Goal 3: Concise */}
                  <label
                    onClick={() => setGoal('concise')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                      goal === 'concise'
                        ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlignLeft className="w-4 h-4 text-purple-500" />
                      <span>Ringkas, Tajam &amp; Profesional</span>
                    </div>
                    <input type="radio" checked={goal === 'concise'} onChange={() => setGoal('concise')} className="accent-purple-600" />
                  </label>
                </div>
              </div>

              {/* Advanced Collapsible Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                    <span>Advanced Formula Penulisan</span>
                  </span>
                  {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isAdvancedOpen && (
                  <div className="mt-2 p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                      Pilih Formula Spesifik
                    </label>
                    <select
                      value={formula}
                      onChange={(e) => setFormula(e.target.value as AiFormula)}
                      className="w-full p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="auto">Auto — Direkomendasikan AI (Kombinasi Terbaik)</option>
                      <option value="star">STAR — Situation, Task, Action, Result</option>
                      <option value="car">CAR — Challenge, Action, Result</option>
                      <option value="par">PAR — Problem, Action, Result</option>
                      <option value="xyz">XYZ — Result, Measurement, Action</option>
                      <option value="sar">SAR — Situation, Action, Result</option>
                      <option value="metrics">Metrics — Berbasis Angka &amp; Data Kuantitatif</option>
                      <option value="ats-keywords">ATS Keywords — Fokus Terminologi Industri</option>
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Formula teknis ini akan diprioritaskan oleh AI saat merestrukturisasi kalimat pengalaman kerja kamu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP: AI INTERVIEW (ASKING CLARIFYING QUESTIONS) */}
          {step === 'interview' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-[10px] bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>AI Interview — Pertanyaan Singkat</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {interviewQuestions[interviewQuestionIdx].question}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Jawaban Singkat Kamu:
                </label>
                <input
                  type="text"
                  value={currentAnswerInput}
                  onChange={(e) => setCurrentAnswerInput(e.target.value)}
                  placeholder={interviewQuestions[interviewQuestionIdx].placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAnswerInterviewNext();
                  }}
                  className="w-full p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleStartAiProcess()}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold underline cursor-pointer"
                >
                  Lewati (Lanjut Generate)
                </button>

                <button
                  type="button"
                  onClick={handleAnswerInterviewNext}
                  className="px-5 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: LOADING ANIMATION */}
          {step === 'loading' && (
            <div className="py-12 space-y-6 text-center animate-in fade-in">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-6 h-6 fill-purple-600" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Menganalisis &amp; Menyusun Kalimat...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Menerapkan formula penulisan &amp; validasi keyword ATS.
                </p>
              </div>

              {/* Animated Checklist */}
              <div className="w-full max-w-xs mx-auto p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Menganalisis Kata Kerja Aksional</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Menyusun Struktur Dampak &amp; Metrik</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Menyelaraskan Kata Kunci ATS</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP: GENERATED RESULTS (3 OPTIONS) */}
          {step === 'results' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hasil Opsi Penulisan AI
                </h4>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  3 Opsi Tersedia
                </span>
              </div>

              {/* Option Cards */}
              <div className="space-y-3">
                {generatedOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                        {opt.formulaTag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      "{opt.text}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(opt.text)}
                        className="px-4 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Gunakan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          {step === 'select' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleStartAiProcess}
                className="px-6 py-2.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Buat dengan AI</span>
              </button>
            </>
          )}

          {step === 'results' && (
            <>
              <button
                type="button"
                onClick={handleStartAiProcess}
                className="px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Strategi</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
