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
  AlertTriangle,
  History,
  Trash2,
  Clock,
  ChevronRight,
} from 'lucide-react';

import { tryLocalTemplateGeneration } from '@/lib/nlp-pruner';

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

export interface AiGenerationOption {
  id: string;
  label: string;
  formulaTag: string;
  text: string;
}

export interface AiGenerationRecord {
  id: string;
  createdAt: string;
  sectionKey: string;
  sectionTitle: string;
  targetJobTitle: string;
  goal: string;
  formula: string;
  inputText: string;
  options: AiGenerationOption[];
}

const STORAGE_KEY = 'cuti_ai_generation_history';
const MAX_HISTORY = 20;

function getStoredHistory(): AiGenerationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredHistory(records: AiGenerationRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
}

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
  const [step, setStep] = useState<'select' | 'interview' | 'loading' | 'results' | 'empty' | 'error' | 'history'>('select');
  const [userRawInput, setUserRawInput] = useState(currentContent);
  const [errorMessage, setErrorMessage] = useState('');

  // History State
  const [historyList, setHistoryList] = useState<AiGenerationRecord[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<AiGenerationRecord | null>(null);

  // Interview state
  const [interviewQuestionIdx, setInterviewQuestionIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<{ [key: string]: string }>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');

  // Generated options state
  const [generatedOptions, setGeneratedOptions] = useState<AiGenerationOption[]>([]);

  // Reset drawer state when opened with new content
  useEffect(() => {
    if (isOpen) {
      // 1. Fetch from Database API first, fallback to localStorage
      fetch('/api/ai/history')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setHistoryList(data.data);
            saveStoredHistory(data.data);
          } else {
            setHistoryList(getStoredHistory());
          }
        })
        .catch(() => {
          setHistoryList(getStoredHistory());
        });

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
      setErrorMessage('');
      setSelectedHistoryRecord(null);
    }
  }, [isOpen, currentContent]);

  if (!isOpen) return null;

  // Kontekstual UX berdasarkan section
  const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
    sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
  );
  const isSummary = sectionKey.toLowerCase().includes('summary') || sectionTitle.toLowerCase().includes('ringkasan');

  const contextLabel = isSummary
    ? 'Ringkasan Profesional Kamu'
    : `Deskripsi ${sectionTitle}`;

  const contextPlaceholderEmpty = isSummary
    ? 'Contoh: Saya seorang frontend developer dengan pengalaman 3 tahun di startup fintech, pernah memimpin tim 5 orang...'
    : isBulletSection
    ? `Contoh: Saya mengelola proyek web app untuk 50+ klien, berhasil meningkatkan konversi 25%...`
    : 'Ceritakan pengalaman atau poin utama kamu secara bebas...';

  const contextPlaceholderSelect = isSummary
    ? 'Ketik ringkasan karir singkat kamu di sini...'
    : isBulletSection
    ? `Ketik tugas, tanggung jawab, atau pencapaian utama di posisi ${sectionTitle}...`
    : 'Ketik poin atau pengalaman sederhana kamu di sini...';

  const contextEmptyTitle = isSummary
    ? 'Ceritakan Profil Profesionalmu'
    : `Ceritakan Pengalamanmu di ${sectionTitle}`;

  const contextEmptyDesc = isSummary
    ? 'Tulis ringkasan singkat tentang latar belakang karir kamu. AI akan menyusunnya menjadi paragraf profesional yang ramah ATS.'
    : 'Tidak perlu menulis dengan format CV kaku. Cukup ceritakan tugas & pencapaian kamu dengan bahasa sehari-hari secara bebas.';

  // Analisis kekurangan data input user untuk menentukan pertanyaan interview yang relevan
  const analyzeInputGaps = (text: string) => {
    const gaps: Array<{ id: string; question: string; placeholder: string }> = [];
    const lower = text.toLowerCase();
    const hasNumbers = /\d+/.test(text);
    const hasTools = /(jira|trello|asana|figma|slack|notion|excel|sql|python|react|node|agile|scrum|kanban|waterfall)/i.test(text);
    const hasMetrics = /(\d+%|\d+\s*(orang|klien|proyek|user|client|tim|bulan|minggu|jam))/i.test(text);
    const hasImpact = /(meningkat|menurun|berhasil|mencapai|menghemat|efisien|optim|reduc|improv|achiev|deliver|launch|complet)/i.test(text);

    if (!hasNumbers && !hasMetrics) {
      gaps.push({
        id: 'scale',
        question: isSummary
          ? 'Berapa tahun pengalaman kerja kamu di bidang ini?'
          : `Di posisi ${sectionTitle}, berapa skala kerjamu? (misal: kelola 5 proyek, tim 10 orang, 50+ klien)`,
        placeholder: isSummary
          ? 'Contoh: 3 tahun pengalaman di bidang fintech'
          : 'Contoh: Mengelola 5 proyek dan tim 10 orang',
      });
    }

    if (!hasImpact) {
      gaps.push({
        id: 'impact',
        question: `Apa hasil atau dampak konkret dari pekerjaanmu? (misal: efisiensi naik 30%, proyek selesai tepat waktu 95%)`,
        placeholder: 'Contoh: Proyek selesai tepat waktu 95%, hemat biaya 20%',
      });
    }

    if (isBulletSection && !hasTools && text.length < 100) {
      gaps.push({
        id: 'tools',
        question: `Tools atau metodologi apa yang kamu gunakan di posisi ini?`,
        placeholder: 'Contoh: Agile/Scrum, Jira, Figma, Google Analytics',
      });
    }

    return gaps;
  };

  const detectedGaps = analyzeInputGaps(userRawInput);
  const shouldShowInterview = detectedGaps.length > 0 && interviewQuestionIdx === 0 && Object.keys(interviewAnswers).length === 0;

  // Use detected gaps as interview questions (only questions that are actually needed)
  const interviewQuestions = detectedGaps;

  const handleStartAiProcess = async () => {
    // Only trigger interview if there are actual data gaps AND user hasn't answered yet
    if (shouldShowInterview && userRawInput.length < 100) {
      setStep('interview');
      return;
    }

    setStep('loading');
    setErrorMessage('');

    try {
      const baseText = userRawInput.trim() || 'Mengelola operasional dan pengembangan proyek secara efektif.';
      const ans1 = interviewAnswers['q1'] ? `Skala kerja: ${interviewAnswers['q1']}.` : '';
      const ans2 = interviewAnswers['q2'] ? `Dampak: ${interviewAnswers['q2']}.` : '';

      const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
        sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
      );

      // Micro Payload User Prompt (~100 tokens max)
      const userPrompt = `TASK: optimize_cv_bullet
ROLE: ${targetJobTitle || 'Professional'}
MODE: ${goal}
SECTION: ${sectionTitle}
INPUT: "${baseText}"
${ans1 ? 'SCALE: ' + ans1 : ''}
${ans2 ? 'IMPACT: ' + ans2 : ''}
FORMAT: ${isBulletSection ? 'Return JSON 3 options with 3-4 bullet points (• Point 1\\n• Point 2\\n• Point 3)' : 'Return JSON 3 options with concise paragraphs'}`;

      const promptSystem = `You are a CV bullet optimization engine. Never fabricate achievements/metrics. Use strong Indonesian action verbs.
Return ONLY valid JSON array with 3 options:
[
  { "id": "opt-1", "label": "Opsi 1 — CAR (Challenge, Action, Result)", "formulaTag": "CAR + Metrics", "text": "..." },
  { "id": "opt-2", "label": "Opsi 2 — XYZ (Result, Measurement, Action)", "formulaTag": "XYZ Formula", "text": "..." },
  { "id": "opt-3", "label": "Opsi 3 — ATS Optimized", "formulaTag": "ATS Keywords + Metrics", "text": "..." }
]`;

      // 1. Coba Local Template Engine (0 Tokens Used, Rp 0) untuk input sederhana
      const localOptions = isBulletSection && !ans1 && !ans2 ? tryLocalTemplateGeneration(baseText, sectionTitle, targetJobTitle) : null;
      if (localOptions && goal === 'auto' && formula === 'auto') {
        setGeneratedOptions(localOptions);
        setStep('results');
        return;
      }

      // 2. Kirim ke API AI Gateway dengan Mode-Aware Cache Key & Micro Payload
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemInstruction: promptSystem,
          promptName: `CV Assistant (${sectionTitle})`,
          contextKey: sectionKey,
          goal,
          role: targetJobTitle,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Gagal menghubungi server AI.');
      }

      // Clean raw text response (strip markdown fences if present)
      let cleanedText = (result.text || '').trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }

      let options: AiGenerationOption[] = [];
      try {
        options = JSON.parse(cleanedText);
      } catch {
        options = [
          {
            id: 'opt-1',
            label: 'Opsi 1 — Rekomendasi AI Utama',
            formulaTag: 'AI Generated',
            text: cleanedText.slice(0, 300),
          },
        ];
      }

      if (Array.isArray(options) && options.length > 0) {
        setGeneratedOptions(options);
        setStep('results');

        // Save to Database API + localStorage fallback
        const newRecord: AiGenerationRecord = {
          id: crypto.randomUUID ? crypto.randomUUID() : `gen-${Date.now()}`,
          createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
          sectionKey,
          sectionTitle,
          targetJobTitle,
          goal,
          formula,
          inputText: baseText,
          options,
        };

        const updatedHistory = [newRecord, ...historyList].slice(0, MAX_HISTORY);
        setHistoryList(updatedHistory);
        saveStoredHistory(updatedHistory);

        // Persist to Database
        fetch('/api/ai/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionKey,
            sectionTitle,
            targetJobTitle,
            goal,
            formula,
            inputText: baseText,
            options,
          }),
        }).catch(() => {
          // silently fail, localStorage fallback already saved
        });
      } else {
        throw new Error('Respon AI tidak dapat diproses.');
      }
    } catch (err: any) {
      console.error('[AI Assistant Drawer] Error:', err);
      setErrorMessage(err.message || 'Terjadi kendala saat menghubungkan ke AI server.');
      setStep('error');
    }
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
      handleStartAiProcess();
    }
  };

  const handleSelectOption = (text: string) => {
    const feedback = `Ditambahkan: hasil terukur, kata kerja aksi, dan keyword ATS relevan.`;
    onApplyContent(text, feedback);
    onClose();
  };

  const handleDeleteHistoryRecord = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter((h) => h.id !== recordId);
    setHistoryList(updated);
    saveStoredHistory(updated);
    if (selectedHistoryRecord?.id === recordId) {
      setSelectedHistoryRecord(null);
    }
  };

  const handleClearAllHistory = () => {
    setHistoryList([]);
    saveStoredHistory([]);
    setSelectedHistoryRecord(null);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-in fade-in"
    >
      {/* Right Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-md md:max-w-lg h-full max-h-[92vh] sm:max-h-full bottom-0 rounded-t-[10px] sm:rounded-none bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 cursor-default"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-orange-50/30 dark:bg-orange-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center shadow-sm shadow-[#1738D1]/30">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bantu Tulis Rekomendasi</span>
                <span className="px-2 py-0.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold border border-orange-200 dark:border-orange-800">
                  Contextual AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px]">
                Konteks: {sectionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {historyList.length > 0 && step !== 'history' && (
              <button
                type="button"
                onClick={() => setStep('history')}
                className="px-2.5 py-1.5 rounded-[10px] bg-orange-100 dark:bg-orange-950/80 hover:bg-orange-200 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer border border-orange-200 dark:border-orange-800"
                title="Lihat Riwayat Generasi AI"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Riwayat ({historyList.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              aria-label="Tutup Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 no-scrollbar">
          {/* STEP: HISTORY */}
          {step === 'history' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                  <History className="w-4 h-4 text-orange-500" />
                  <span>Riwayat Generasi AI ({historyList.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                  <Clock className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
                  <p>Belum ada riwayat generasi AI yang tersimpan.</p>
                </div>
              ) : selectedHistoryRecord ? (
                /* Detail View of Selected History Record */
                <div className="space-y-4 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryRecord(null)}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Kembali ke daftar riwayat
                  </button>

                  <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{selectedHistoryRecord.createdAt}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{selectedHistoryRecord.sectionTitle}</span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 italic line-clamp-2">
                      &quot;{selectedHistoryRecord.inputText}&quot;
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Opsi Tersimpan ({selectedHistoryRecord.options.length})
                    </h5>
                    {selectedHistoryRecord.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                            {opt.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-200 dark:border-orange-800">
                            {opt.formulaTag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          &quot;{opt.text}&quot;
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(opt.text)}
                            className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
                          >
                            <span>Gunakan Poin Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* History List Cards */
                <div className="space-y-3">
                  {historyList.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedHistoryRecord(rec)}
                      className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition cursor-pointer space-y-2 group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {rec.sectionTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-[6px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold border border-orange-200 dark:border-orange-800">
                            {rec.options.length} Opsi
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">{rec.createdAt}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistoryRecord(rec.id, e)}
                            className="p-1 rounded-[6px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Hapus riwayat ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                        &quot;{rec.inputText}&quot;
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-orange-600 dark:text-orange-400 font-bold pt-1">
                        <span>Pilih dari {rec.options.length} variasi AI</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP: EMPTY STATE */}
          {step === 'empty' && (
            <div className="space-y-4 text-center py-8 px-2">
              <div className="w-14 h-14 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-500 dark:text-orange-400 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {contextEmptyTitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {contextEmptyDesc}
                </p>
              </div>

              <textarea
                rows={4}
                value={userRawInput}
                onChange={(e) => setUserRawInput(e.target.value)}
                placeholder={contextPlaceholderEmpty}
                className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
              />

              <button
                type="button"
                disabled={!userRawInput.trim()}
                onClick={() => setStep('select')}
                className="w-full py-3 px-4 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <span>Mulai Susun Kalimat</span>
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
                  <span>{contextLabel}</span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">Terkoneksi Editor</span>
                </label>
                <textarea
                  rows={3}
                  value={userRawInput}
                  onChange={(e) => setUserRawInput(e.target.value)}
                  placeholder={contextPlaceholderSelect}
                  className="w-full p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
                />
              </div>

              {/* Goal Selection Header */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Pilih Tujuan Penulisan
                </h4>

                {/* Option: Recommendation (DEFAULT) */}
                <div
                  onClick={() => setGoal('auto')}
                  className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-start gap-3 ${
                    goal === 'auto'
                      ? 'bg-orange-50/90 dark:bg-orange-950/60 border-[#1738D1] dark:border-orange-600 ring-2 ring-[#1738D1]/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-orange-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#1738D1] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 fill-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rekomendasi Terbaik</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[10px] bg-[#1738D1] text-white">
                          Default
                        </span>
                      </span>
                      {goal === 'auto' && <CheckCircle2 className="w-4 h-4 text-orange-500 dark:text-orange-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Sistem menganalisis posisi dan memilih kombinasi formula terbaik secara otomatis.
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
                        ? 'bg-orange-50/60 dark:bg-orange-950/40 border-[#1738D1] text-orange-700 dark:text-orange-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span>Fokus Pencapaian &amp; Dampak Terukur</span>
                    </div>
                    <input type="radio" checked={goal === 'impact'} onChange={() => setGoal('impact')} className="accent-[#1738D1]" />
                  </label>

                  {/* Goal 2: ATS */}
                  <label
                    onClick={() => setGoal('ats')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                      goal === 'ats'
                        ? 'bg-orange-50/60 dark:bg-orange-950/40 border-[#1738D1] text-orange-700 dark:text-orange-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-orange-500" />
                      <span>Fokus Optimalisasi Keyword ATS</span>
                    </div>
                    <input type="radio" checked={goal === 'ats'} onChange={() => setGoal('ats')} className="accent-[#1738D1]" />
                  </label>

                  {/* Goal 3: Concise */}
                  <label
                    onClick={() => setGoal('concise')}
                    className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                      goal === 'concise'
                        ? 'bg-orange-50/60 dark:bg-orange-950/40 border-[#1738D1] text-orange-700 dark:text-orange-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AlignLeft className="w-4 h-4 text-orange-500" />
                      <span>Ringkas, Tajam &amp; Profesional</span>
                    </div>
                    <input type="radio" checked={goal === 'concise'} onChange={() => setGoal('concise')} className="accent-[#1738D1]" />
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
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
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
                      className="w-full p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1738D1]"
                    >
                      <option value="auto">Auto — Direkomendasikan Sistem (Kombinasi Terbaik)</option>
                      <option value="star">STAR — Situation, Task, Action, Result</option>
                      <option value="car">CAR — Challenge, Action, Result</option>
                      <option value="par">PAR — Problem, Action, Result</option>
                      <option value="xyz">XYZ — Result, Measurement, Action</option>
                      <option value="sar">SAR — Situation, Action, Result</option>
                      <option value="metrics">Metrics — Berbasis Angka &amp; Data Kuantitatif</option>
                      <option value="ats-keywords">ATS Keywords — Fokus Terminologi Industri</option>
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Formula teknis ini akan diprioritaskan saat merestrukturisasi kalimat pengalaman kerja kamu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP: INTERVIEW (ASKING CLARIFYING QUESTIONS — hanya muncul jika ada data yang kurang) */}
          {step === 'interview' && interviewQuestions.length > 0 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {interviewQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= interviewQuestionIdx ? 'bg-[#1738D1]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="p-4 rounded-[10px] bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span>Data Tambahan Dibutuhkan</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {interviewQuestionIdx + 1} / {interviewQuestions.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  AI membutuhkan informasi tambahan agar hasilnya lebih akurat & terukur.
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pt-1">
                  {interviewQuestions[interviewQuestionIdx]?.question}
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
                  placeholder={interviewQuestions[interviewQuestionIdx]?.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAnswerInterviewNext();
                  }}
                  className="w-full p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleStartAiProcess()}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold underline cursor-pointer"
                >
                  Lewati (Lanjut Proses)
                </button>

                <button
                  type="button"
                  onClick={handleAnswerInterviewNext}
                  className="px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
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
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 dark:border-orange-900 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                  <Sparkles className="w-6 h-6 fill-orange-500" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Menganalisis &amp; Menyusun Kalimat dengan Real AI...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Menghubungi AI Gateway &amp; memproses keyword ATS.
                </p>
              </div>

              {/* Animated Checklist */}
              <div className="w-full max-w-xs mx-auto p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Menghubungi AI Provider</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Menerapkan Formula STAR/CAR/XYZ</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Mengoptimalkan Keyword ATS</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP: ERROR */}
          {step === 'error' && (
            <div className="py-8 space-y-4 text-center animate-in fade-in">
              <div className="w-14 h-14 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-xs mx-auto">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Gagal Memproses AI
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-medium">
                  {errorMessage || 'Terjadi kesalahan sistem saat menghubungi server AI.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition inline-flex items-center gap-2 cursor-pointer border-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* STEP: RESULTS (3 OPTIONS) */}
          {step === 'results' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hasil Rekomendasi Penulisan AI Real
                </h4>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                  {generatedOptions.length} Opsi Tersedia
                </span>
              </div>

              {/* Option Cards */}
              <div className="space-y-3">
                {generatedOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600 transition space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-200 dark:border-orange-800">
                        {opt.formulaTag}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      &quot;{opt.text}&quot;
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(opt.text)}
                        className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
                      >
                        <span>Gunakan Poin Ini</span>
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
                className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-2 cursor-pointer border-0"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Proses Sekarang</span>
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
                <span>Susun Ulang AI</span>
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
