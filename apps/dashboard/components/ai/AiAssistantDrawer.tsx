'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  EditIcon,
  TargetIcon,
  FileCheckIcon,
  AlignLeftIcon,
  ZapIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  ClockIcon,
  TrashIcon,
  ChevronRightIcon,
  SlidersIcon,
  CopyIcon,
  CheckIcon,
  FileTextIcon,
  LoaderIcon,
} from '@/components/icons/CustomIcons';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { tryLocalTemplateGeneration } from '@/lib/nlp-pruner';
import { buildCvRewriterSystemPrompt, buildCvRewriterUserPrompt } from '@/lib/cv-rewriter-prompt';
import type { CvPurpose } from '@/lib/cv-purpose-scoring-engine';
import type { AiKeywordSignal } from '@/lib/cv-purpose-ats-score';

export interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionTitle: string;
  currentContent?: string;
  onApplyContent: (newContent: string, feedbackMsg: string) => void;
  targetJobTitle?: string;
  /** Profil tujuan CV aktif — menentukan level karier & bahasa output prompt. */
  purpose?: CvPurpose;
  /** Nama perusahaan entri pengalaman yang sedang diedit (opsional). */
  companyName?: string;
  /** User masih bekerja di entri ini sekarang (kata kerja bentuk kini). */
  isCurrentJob?: boolean;
  /** Kata kunci dari JD lowongan target (opsional, memperkuat goal ATS). */
  jobKeywords?: string;
  /** Callback keyword ATS yang dipakai AI saat user meng-apply satu opsi — untuk skor ATS real-time. */
  onKeywordsApplied?: (sectionKey: string, keywords: string[]) => void;
}

export type AiGoal = 'auto' | 'impact' | 'ats' | 'concise';
export type AiFormula = 'auto' | 'star' | 'car' | 'par' | 'xyz' | 'sar' | 'metrics' | 'ats-keywords';

export interface AiGenerationOption {
  id: string;
  batchId?: number;
  batchLabel?: string;
  createdAt?: string;
  label: string;
  formulaTag: string;
  text: string;
  /** Output terstruktur baru dari cv-rewriter-prompt (per bullet meta). */
  bullets?: Array<{
    text: string;
    formula_applied?: string;
    has_placeholder?: boolean;
    keywords_used?: string[];
  }>;
  notes?: string;
}

/** Deteksi placeholder angka — dari meta bullets ATAU pattern teks (termasuk local template). */
export function optionHasPlaceholder(opt: AiGenerationOption): boolean {
  if (opt.bullets?.some((b) => b.has_placeholder)) return true;
  return /\[(isi|tambahkan)[^\]]*\]/i.test(opt.text || '');
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

const STORAGE_KEY = 'employr_ai_generation_history';
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
  purpose,
  companyName,
  isCurrentJob = false,
  jobKeywords: initialJobKeywords,
  onKeywordsApplied,
}) => {
  const [goal, setGoal] = useState<AiGoal>('auto');
  const [formula, setFormula] = useState<AiFormula>('auto');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isStyleConfigOpen, setIsStyleConfigOpen] = useState(false);
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

  // JD keywords state (untuk goal ATS)
  const [jobKeywords, setJobKeywords] = useState(initialJobKeywords || '');

  // Dedicated state for separated summary forms & multi-batch accumulation
  const [currentSummary, setCurrentSummary] = useState<string>(currentContent || '');
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [appliedOptionId, setAppliedOptionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const prevSectionKeyRef = useRef(sectionKey);

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

      setCurrentSummary(currentContent || '');
      setUserRawInput(currentContent || '');

      // Reset options if user switched to another section
      if (prevSectionKeyRef.current !== sectionKey) {
        setGeneratedOptions([]);
        setGenerationCount(0);
        setAiPromptInput('');
        setAppliedOptionId(null);
        prevSectionKeyRef.current = sectionKey;
      }

      setStep('select');
      setGoal('auto');
      setFormula('auto');
      setIsStyleConfigOpen(false);
      setIsAdvancedOpen(false);
      setInterviewQuestionIdx(0);
      setInterviewAnswers({});
      setCurrentAnswerInput('');
      setErrorMessage('');
      setSelectedHistoryRecord(null);
      setJobKeywords(initialJobKeywords || '');
      setIsLoadingAi(false);
    }
  }, [isOpen, sectionKey, currentContent, initialJobKeywords]);

  if (!isOpen) return null;

  // Kontekstual UX berdasarkan section
  const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
    sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
  );
  const isSummary = sectionKey.toLowerCase().includes('summary') || sectionTitle.toLowerCase().includes('ringkasan');

  const contextLabel = isSummary
    ? 'Ceritakan latar belakang & target posisi'
    : `Deskripsi ${sectionTitle}`;

  const contextPlaceholderEmpty = isSummary
    ? 'Contoh: Lulusan baru Akuntansi UI, mahir SAP & Excel, aktif di organisasi, mencari posisi Junior Finance...'
    : isBulletSection
    ? `Contoh: Saya mengelola proyek web app untuk 50+ klien, berhasil meningkatkan konversi 25%...`
    : 'Ceritakan pengalaman atau poin utama kamu secara bebas...';

  const contextPlaceholderSelect = isSummary
    ? 'Ketik poin pengalaman, keahlian utama, atau posisi yang kamu tuju...'
    : isBulletSection
    ? `Ketik tugas, tanggung jawab, atau pencapaian utama di posisi ${sectionTitle}...`
    : 'Ketik poin atau pengalaman sederhana kamu di sini...';

  const contextEmptyTitle = isSummary
    ? 'Ceritakan tentang Kamu ke Herdi AI'
    : `Ceritakan Pengalamanmu di ${sectionTitle}`;

  const contextEmptyDesc = isSummary
    ? 'Tulis poin singkat latar belakang & keahlianmu. Herdi AI akan menyusunnya jadi ringkasan profesional yang ramah ATS.'
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

  const handleStartAiProcess = async (promptOverride?: string) => {
    // Only trigger interview if non-summary AND there are actual data gaps AND user hasn't answered yet
    if (!isSummary && shouldShowInterview && userRawInput.length < 100) {
      setStep('interview');
      return;
    }

    setIsLoadingAi(true);
    if (!isSummary) setStep('loading');
    setErrorMessage('');

    try {
      const baseText = isSummary
        ? (promptOverride || aiPromptInput.trim() || currentSummary.trim() || 'Professional muda yang berdedikasi dan siap berkembang.')
        : (promptOverride || userRawInput.trim() || 'Mengelola operasional dan pengembangan proyek secara efektif.');

      const ans1 = interviewAnswers['q1'] ? `Skala kerja: ${interviewAnswers['q1']}.` : '';
      const ans2 = interviewAnswers['q2'] ? `Dampak: ${interviewAnswers['q2']}.` : '';

      const isBulletSection = ['experience', 'internships', 'projects', 'organizations', 'pengalaman'].some((k) =>
        sectionKey.toLowerCase().includes(k) || sectionTitle.toLowerCase().includes(k)
      );

      // System prompt dinamis (cv-rewriter-prompt): 1 template + variabel per request.
      // Tujuan penulisan & formula = dua dimensi kontrol independen dari UI drawer.
      const promptSystem = buildCvRewriterSystemPrompt({
        jabatan: targetJobTitle,
        perusahaan: companyName,
        isCurrentJob,
        purpose,
        goal,
        formula,
        jobKeywords: jobKeywords.trim() || undefined,
      });

      const extraContext = [ans1, ans2].filter(Boolean);
      const userPrompt = isBulletSection
        ? buildCvRewriterUserPrompt(baseText, extraContext)
        : `TASK: ${isSummary ? 'optimize_summary' : 'optimize_section'}
SECTION: ${sectionTitle}
INPUT: "${baseText}"
${ans1 ? 'SKALA: ' + ans1 : ''}
${ans2 ? 'DAMPAK: ' + ans2 : ''}
FORMAT: JSON array TEPAT 3 opsi, masing-masing satu paragraf ringkas profesional (tanpa bullet).`; // Section non-bullet (mis. summary) tetap pakai format paragraf

      // 1. Coba Local Template Engine (0 Tokens Used, Rp 0) untuk input sederhana
      const localOptions = isBulletSection && !ans1 && !ans2 ? tryLocalTemplateGeneration(baseText, sectionTitle, targetJobTitle) : null;
      let options: AiGenerationOption[] = [];

      if (localOptions && goal === 'auto' && formula === 'auto') {
        options = localOptions;
      } else {
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
            feature: 'cv_assistant',
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

        try {
          const parsed = JSON.parse(cleanedText);
          // Format baru: {bullets: [...], notes} per opsi (cv-rewriter-prompt).
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.bullets) {
            options = parsed.map((o: any, idx: number) => ({
              id: o.id || `opt-${idx + 1}`,
              label: o.label || `Opsi ${idx + 1}`,
              formulaTag: o.formulaTag || o.formula_applied || 'AI',
              text: Array.isArray(o.bullets) ? o.bullets.map((b: any) => b?.text || '').join('\n') : '',
              bullets: o.bullets,
              notes: o.notes,
            }));
          } else if (Array.isArray(parsed)) {
            // Format lama (array {id,label,formulaTag,text}) — tetap didukung.
            options = parsed;
          } else if (parsed && typeof parsed === 'object') {
            // Satu objek tunggal dengan bullets
            options = [{
              id: parsed.id || 'opt-1',
              label: parsed.label || 'Opsi 1 — Rekomendasi AI Utama',
              formulaTag: parsed.formulaTag || 'Rekomendasi Teroptimasi',
              text: Array.isArray(parsed.bullets) ? parsed.bullets.map((b: any) => b?.text || '').join('\n') : String(parsed.text || ''),
              bullets: Array.isArray(parsed.bullets) ? parsed.bullets : undefined,
              notes: parsed.notes,
            }];
          }
        } catch {
          options = [
            {
              id: 'opt-1',
              label: 'Opsi 1 — Rekomendasi AI Utama',
              formulaTag: 'Rekomendasi Teroptimasi',
              text: cleanedText.slice(0, 300),
            },
          ];
        }
      }

      if (Array.isArray(options) && options.length > 0) {
        const nextBatch = generationCount + 1;
        setGenerationCount(nextBatch);
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const mappedOptions: AiGenerationOption[] = options.map((opt, idx) => ({
          ...opt,
          id: `batch-${nextBatch}-opt-${idx + 1}-${Date.now()}`,
          batchId: nextBatch,
          batchLabel: `Generasi #${nextBatch}`,
          createdAt: timeNow,
        }));

        // Akumulasi opsi baru di awal (terbaru di atas) tanpa menghapus opsi lama!
        setGeneratedOptions((prev) => [...mappedOptions, ...prev]);
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
          options: mappedOptions,
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
            options: mappedOptions,
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
      if (!isSummary) setStep('error');
    } finally {
      setIsLoadingAi(false);
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

  const handleSelectOption = (opt: AiGenerationOption) => {
    setAppliedOptionId(opt.id);
    setCurrentSummary(opt.text);

    const placeholderHint = optionHasPlaceholder(opt)
      ? ' ⚠️ Lengkapi placeholder [isi angka/skala] dengan data aslimu sebelum export.'
      : '';
    const notesHint = opt.notes ? ` ${opt.notes}` : '';
    const usedKw = Array.from(new Set(opt.bullets?.flatMap((b) => b.keywords_used || []) || []));
    const kwHint = usedKw.length > 0 ? ` Keyword: ${usedKw.slice(0, 5).join(', ')}.` : '';
    const feedback = `Hasil berhasil diterapkan ke CV: hasil terukur dan keyword relevan.${kwHint}${placeholderHint}${notesHint}`;
    if (usedKw.length > 0 && onKeywordsApplied) {
      onKeywordsApplied(sectionKey, usedKw);
    }
    onApplyContent(opt.text, feedback);

    // Non-summary section closes drawer, summary keeps drawer open for comparison
    if (!isSummary) {
      onClose();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
        if (e.target === e.currentTarget) {
          if (isStyleConfigOpen) {
            setIsStyleConfigOpen(false);
          } else {
            onClose();
          }
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end items-stretch transition-opacity duration-300 animate-in fade-in overflow-hidden"
    >
      {/* Side Configuration Drawer (Memunculkan drawer baru di sampingnya) */}
      {isStyleConfigOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute sm:relative z-20 sm:z-10 w-full sm:w-80 md:w-96 h-full max-h-[92vh] sm:max-h-full bottom-0 sm:bottom-auto rounded-t-[10px] sm:rounded-none bg-white dark:bg-slate-900 border-l sm:border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 cursor-default"
        >
          {/* Header Konfigurasi */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#1738D1]/10 text-[#1738D1] dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <SlidersIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Gaya Penulisan
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Tujuan, Formula &amp; Keyword
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(goal !== 'auto' || formula !== 'auto') && (
                <button
                  type="button"
                  onClick={() => {
                    setGoal('auto');
                    setFormula('auto');
                  }}
                  className="text-[10px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline px-1.5 py-0.5 cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsStyleConfigOpen(false)}
                className="w-7 h-7 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
                aria-label="Tutup Konfigurasi"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Konfigurasi */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 no-scrollbar">
            {/* Goal Selection Header */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pilih Tujuan Penulisan
              </h4>

              {/* Option: Recommendation (DEFAULT) */}
              <div
                onClick={() => setGoal('auto')}
                className={`p-3 rounded-[10px] border transition cursor-pointer flex items-start gap-2.5 ${
                  goal === 'auto'
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 border-[#1738D1] dark:border-blue-600 ring-2 ring-[#1738D1]/20'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#1738D1] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <TargetIcon className="w-3 h-3 fill-white" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Rekomendasi Terbaik</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[10px] bg-[#1738D1] text-white">
                        Default
                      </span>
                    </span>
                    {goal === 'auto' && <CheckCircleIcon className="w-4 h-4 text-[#1738D1] dark:text-blue-400" />}
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
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1738D1] text-[#1738D1] dark:text-blue-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TargetIcon className="w-4 h-4 text-[#1738D1]" />
                    <span>Fokus Pencapaian &amp; Dampak Terukur</span>
                  </div>
                  <input type="radio" checked={goal === 'impact'} onChange={() => setGoal('impact')} className="accent-[#1738D1]" />
                </label>

                {/* Goal 2: ATS */}
                <label
                  onClick={() => setGoal('ats')}
                  className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                    goal === 'ats'
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1738D1] text-[#1738D1] dark:text-blue-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheckIcon className="w-4 h-4 text-[#1738D1]" />
                    <span>Fokus Optimalisasi Keyword ATS</span>
                  </div>
                  <input type="radio" checked={goal === 'ats'} onChange={() => setGoal('ats')} className="accent-[#1738D1]" />
                </label>

                {/* JD Keywords Input — muncul saat goal ATS dipilih */}
                {goal === 'ats' && (
                  <div className="p-3 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Kata Kunci Lowongan Target <span className="text-slate-400 font-medium">(opsional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={jobKeywords}
                      onChange={(e) => setJobKeywords(e.target.value)}
                      placeholder="Contoh: React, TypeScript, REST API, Agile..."
                      className="w-full p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Sistem memprioritaskan istilah yang cocok dengan daftar ini di bullet CV kamu.
                    </p>
                  </div>
                )}

                {/* Goal 3: Concise */}
                <label
                  onClick={() => setGoal('concise')}
                  className={`flex items-center justify-between p-3 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                    goal === 'concise'
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1738D1] text-[#1738D1] dark:text-blue-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlignLeftIcon className="w-4 h-4 text-[#1738D1]" />
                    <span>Ringkas, Tajam &amp; Profesional</span>
                  </div>
                  <input type="radio" checked={goal === 'concise'} onChange={() => setGoal('concise')} className="accent-[#1738D1]" />
                </label>
              </div>
            </div>

            {/* Advanced Collapsible Section */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <ZapIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Advanced Formula Penulisan</span>
                </span>
                {isAdvancedOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
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
                    <option value="auto">Auto — Direkomendasikan Sistem</option>
                    <option value="star">STAR — Situation, Task, Action, Result</option>
                    <option value="car">CAR — Challenge, Action, Result</option>
                    <option value="par">PAR — Problem, Action, Result</option>
                    <option value="xyz">XYZ — Result, Measurement, Action</option>
                    <option value="sar">SAR — Situation, Action, Result</option>
                    <option value="metrics">Metrics — Berbasis Data Kuantitatif</option>
                    <option value="ats-keywords">ATS Keywords — Terminologi Industri</option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Formula teknis ini akan diprioritaskan saat menyusun kalimat pengalaman kerja kamu.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer Konfigurasi */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
              {goal === 'auto'
                ? 'Rekomendasi Sistem'
                : goal === 'impact'
                ? 'Fokus Dampak'
                : goal === 'ats'
                ? 'Fokus ATS'
                : 'Ringkas & Tajam'}
            </span>
            <button
              type="button"
              onClick={() => setIsStyleConfigOpen(false)}
              className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
            >
              <span>Selesai</span>
              <CheckCircleIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Right Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-full ${
          isSummary ? 'sm:max-w-xl md:max-w-2xl' : 'sm:max-w-md md:max-w-lg'
        } h-full max-h-[92vh] sm:max-h-full bottom-0 rounded-t-[10px] sm:rounded-none bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 cursor-default`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-orange-50/30 dark:bg-orange-950/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center shadow-sm shadow-[#1738D1]/30">
              <TargetIcon className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isSummary ? 'Bantu Tulis Ringkasan Profil' : 'Bantu Tulis Rekomendasi'}</span>
                <span className="px-2 py-0.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold border border-orange-200 dark:border-orange-800">
                  {isSummary ? 'Herdi AI' : 'Contextual AI'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[260px]">
                {isSummary ? 'Susun & bandingkan variasi ringkasan profesional' : `Konteks: ${sectionTitle}`}
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
                <ClockIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Riwayat ({historyList.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              aria-label="Tutup Drawer"
            >
              <CloseIcon className="w-4 h-4" />
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
                  <ClockIcon className="w-4 h-4 text-orange-500" />
                  <span>Riwayat Generasi AI ({historyList.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <TrashIcon className="w-3 h-3" />
                    <span>Hapus Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-2.5 py-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                  <ClockIcon className="w-8 h-8 mx-auto opacity-50 text-slate-400" />
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
                            onClick={() => handleSelectOption(opt)}
                            className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
                          >
                            <span>Gunakan Poin Ini</span>
                            
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
                          <span className="px-2 py-0.5 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold border border-orange-200 dark:border-orange-800">
                            {rec.options.length} Opsi
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">{rec.createdAt}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistoryRecord(rec.id, e)}
                            className="p-1 rounded-[10px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Hapus riwayat ini"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                        &quot;{rec.inputText}&quot;
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-orange-600 dark:text-orange-400 font-bold pt-1">
                        <span>Pilih dari {rec.options.length} variasi AI</span>
                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEDICATED VIEW FOR RINGKASAN PROFIL (SUMMARY) */}
          {step !== 'history' && isSummary && (
            <div className="space-y-5 animate-in fade-in">
              {/* FORM 1: RINGKASAN PROFIL (SAAT INI DI CV) */}
              <div className="p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[10px] bg-blue-100 dark:bg-blue-950 text-[#1738D1] dark:text-blue-400 flex items-center justify-center">
                      <FileTextIcon className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Ringkasan Profil (Saat Ini di CV)
                    </label>
                  </div>

                  {currentSummary.trim() ? (
                    <span className="px-2 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Tersimpan di CV</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      Belum Ada Ringkasan
                    </span>
                  )}
                </div>

                <AutoResizeTextarea
                  minHeight={80}
                  maxHeight={260}
                  value={currentSummary}
                  onChange={(e) => setCurrentSummary(e.target.value)}
                  placeholder="Ringkasan profil CV kamu masih kosong. Gunakan hasil rekomendasi teroptimasi di bawah atau ketik langsung di sini..."
                  className="w-full p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span>
                    {currentSummary.trim() ? currentSummary.trim().split(/\s+/).length : 0} kata • {currentSummary.length} karakter
                  </span>
                  {currentSummary.trim() !== (currentContent || '').trim() && (
                    <button
                      type="button"
                      onClick={() => onApplyContent(currentSummary, 'Ringkasan Profil CV berhasil diperbarui.')}
                      className="px-2.5 py-1 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <CheckIcon className="w-3 h-3" />
                      <span>Simpan Perubahan ke CV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* FORM 2: INPUT UNTUK AI (CERITAKAN TENTANG KAMU) */}
              <div className="p-4 rounded-[10px] bg-white dark:bg-slate-800/80 border-2 border-orange-200/90 dark:border-orange-900/60 shadow-xs space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <TargetIcon className="w-3.5 h-3.5 fill-orange-500" />
                      </div>
                      <label className="text-xs font-bold text-slate-900 dark:text-white">
                        Ceritakan latar belakang & target posisi
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsStyleConfigOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-bold transition cursor-pointer ${
                        isStyleConfigOpen
                          ? 'text-white bg-[#1738D1]'
                          : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'
                      }`}
                      title="Konfigurasi Gaya & Fokus Penulisan"
                    >
                      <SlidersIcon className="w-3 h-3" />
                      <span>{isStyleConfigOpen ? 'Tutup Opsi' : 'Gaya Penulisan'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8">
                    Tulis poin pengalaman, keahlian utama, atau posisi yang kamu tuju.
                  </p>
                </div>

                <AutoResizeTextarea
                  minHeight={90}
                  maxHeight={260}
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Contoh: Lulusan baru Akuntansi UI, mahir SAP & Excel, pengalaman magang 6 bulan di KAP, mencari posisi Junior Auditor..."
                  className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Gaya: </span>
                    <span className="font-bold text-[#1738D1] dark:text-blue-400">
                      {goal === 'auto'
                        ? 'Rekomendasi Otomatis'
                        : goal === 'impact'
                        ? 'Fokus Dampak'
                        : goal === 'ats'
                        ? 'Fokus ATS'
                        : 'Ringkas'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isLoadingAi}
                    onClick={() => handleStartAiProcess()}
                    className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-60 text-white font-extrabold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-2 cursor-pointer border-0"
                  >
                    {isLoadingAi ? (
                      <>
                        <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Memproses...</span>
                      </>
                    ) : (
                      <>
                        <TargetIcon className="w-3.5 h-3.5 fill-white" />
                        <span>{generatedOptions.length > 0 ? 'Susun Alternatif Baru' : 'Susun Rekomendasi'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* FORM 3: HASIL GENERATE AI (DAFTAR REKOMENDASI & PEMBANDING) */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Hasil Rekomendasi Teroptimasi
                    </h4>
                    {generatedOptions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-[10px] font-bold border border-orange-200 dark:border-orange-800">
                        {generatedOptions.length} Variasi
                      </span>
                    )}
                  </div>

                  {generatedOptions.length > 0 && (
                    <button
                      type="button"
                      disabled={isLoadingAi}
                      onClick={() => handleStartAiProcess()}
                      className="px-3 py-1.5 rounded-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Generate variasi baru tanpa menghilangkan hasil sebelumnya"
                    >
                      <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                      <span>Susun Alternatif Baru</span>
                    </button>
                  )}
                </div>

                {/* Loading state for summary */}
                {isLoadingAi && (
                  <div className="p-4 rounded-[10px] bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 flex items-center gap-3 animate-in fade-in">
                    <LoaderIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Sistem sedang menyusun variasi ringkasan...
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Memproses keyword ATS dan mengoptimalkan struktur kalimat profesional.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {errorMessage && (
                  <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartAiProcess()}
                      className="text-xs font-bold underline hover:no-underline cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {/* Empty State when no options yet */}
                {generatedOptions.length === 0 && !isLoadingAi && (
                  <div className="py-8 px-4 text-center rounded-[10px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <TargetIcon className="w-8 h-8 text-orange-400 mx-auto opacity-70" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Belum ada rekomendasi yang disusun
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Ketik poin pengalaman dan keahlianmu di form atas, lalu klik <strong>Susun Rekomendasi</strong> untuk menghasilkan berbagai opsi ringkasan profil siap pakai.
                      </p>
                    </div>
                  </div>
                )}

                {/* List of Generated Options for Comparison */}
                {generatedOptions.length > 0 && (
                  <div className="space-y-3">
                    {generatedOptions.map((opt) => {
                      const isApplied = appliedOptionId === opt.id || currentSummary.trim() === opt.text.trim();
                      const isLatestBatch = opt.batchId === generationCount;

                      return (
                        <div
                          key={opt.id}
                          className={`p-4 rounded-[10px] border transition space-y-3 shadow-xs ${
                            isApplied
                              ? 'bg-blue-50/40 dark:bg-blue-950/30 border-[#1738D1] dark:border-blue-500 ring-1 ring-[#1738D1]/30'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold ${
                                  isLatestBatch
                                    ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {opt.batchLabel || `Generasi #${opt.batchId || 1}`}
                                {isLatestBatch && generationCount > 1 && ' (Terbaru)'}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {opt.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-[10px] bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                {opt.formulaTag}
                              </span>
                              {opt.createdAt && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {opt.createdAt}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line select-text">
                            &quot;{opt.text}&quot;
                          </div>

                          {optionHasPlaceholder(opt) && (
                            <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                              <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>Ada placeholder — isi dengan data riil kamu sebelum ekspor CV.</span>
                            </div>
                          )}

                          {opt.notes && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                              {opt.notes}
                            </p>
                          )}

                          {opt.bullets?.some((b) => b.keywords_used && b.keywords_used.length > 0) && (
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(opt.bullets.flatMap((b) => b.keywords_used || []))).slice(0, 6).map((kw) => (
                                <span
                                  key={kw}
                                  className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleCopyText(opt.id, opt.text)}
                              className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {copiedId === opt.id ? (
                                <>
                                  <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-extrabold">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <CopyIcon className="w-3.5 h-3.5" />
                                  <span>Salin Teks</span>
                                </>
                              )}
                            </button>

                            {isApplied ? (
                              <div className="px-3.5 py-1.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Sedang Digunakan di CV</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectOption(opt)}
                                className="px-3.5 py-1.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
                              >
                                <span>Gunakan Hasil Ini</span>
                                
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REGULAR WORKFLOW FOR NON-SUMMARY SECTIONS */}
          {step !== 'history' && !isSummary && (
            <>
              {/* STEP: EMPTY STATE */}
              {step === 'empty' && (
                <div className="space-y-4 text-center py-8 px-2">
                  <div className="w-14 h-14 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-500 dark:text-orange-400 flex items-center justify-center mx-auto shadow-sm">
                    <TargetIcon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {contextEmptyTitle}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      {contextEmptyDesc}
                    </p>
                  </div>

                  <AutoResizeTextarea
                    minHeight={90}
                    maxHeight={450}
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
                    
                  </button>
                </div>
              )}

              {/* STEP: SELECT STRATEGY & GOALS */}
              {step === 'select' && (
                <div className="space-y-3.5">
                  {/* Input Draft Preview Header */}
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {contextLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsStyleConfigOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition cursor-pointer ${
                        isStyleConfigOpen
                          ? 'text-white bg-[#1738D1] hover:bg-[#132EA8] shadow-xs'
                          : goal !== 'auto' || formula !== 'auto'
                          ? 'text-[#1738D1] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700'
                          : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Buka panel konfigurasi gaya penulisan di samping"
                    >
                      <SlidersIcon className="w-3.5 h-3.5" />
                      <span>{isStyleConfigOpen ? 'Tutup Konfigurasi' : 'Konfigurasi Gaya Penulisan'}</span>
                      {goal !== 'auto' && !isStyleConfigOpen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1738D1] dark:bg-blue-400" />
                      )}
                    </button>
                  </div>

                  {/* Active Style Indicator Banner */}
                  <div className="flex items-center justify-between gap-2 text-[11px] py-1.5 px-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Gaya aktif:</span>
                      <span className="font-bold text-[#1738D1] dark:text-blue-400">
                        {goal === 'auto'
                          ? 'Rekomendasi Otomatis'
                          : goal === 'impact'
                          ? 'Fokus Dampak & Metrik'
                          : goal === 'ats'
                          ? 'Optimalisasi ATS'
                          : 'Ringkas & Tajam'}
                        {formula !== 'auto' ? ` • Formula ${formula.toUpperCase()}` : ''}
                      </span>
                    </div>
                    {!isStyleConfigOpen && (
                      <button
                        type="button"
                        onClick={() => setIsStyleConfigOpen(true)}
                        className="text-[11px] font-bold text-[#1738D1] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Ubah
                      </button>
                    )}
                  </div>

                  {/* Dynamic Height Textarea */}
                  <AutoResizeTextarea
                    minHeight={120}
                    maxHeight={500}
                    value={userRawInput}
                    onChange={(e) => setUserRawInput(e.target.value)}
                    placeholder={contextPlaceholderSelect}
                    className="w-full p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] leading-relaxed"
                  />
                </div>
              )}

              {/* STEP: INTERVIEW */}
              {step === 'interview' && interviewQuestions.length > 0 && (
                <div className="space-y-5 animate-in fade-in">
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
                        <MessageSquareIcon className="w-4 h-4 text-orange-600" />
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
                      <TargetIcon className="w-6 h-6 fill-orange-500" />
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

                  <div className="w-full max-w-xs mx-auto p-4 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Menghubungi AI Provider</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Menerapkan Formula STAR/CAR/XYZ</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 animate-pulse">
                      <TargetIcon className="w-4 h-4" />
                      <span>Mengoptimalkan Keyword ATS</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: ERROR */}
              {step === 'error' && (
                <div className="py-8 space-y-4 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangleIcon className="w-7 h-7" />
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
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              )}

              {/* STEP: RESULTS */}
              {step === 'results' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Hasil Rekomendasi Penulisan Teroptimasi
                    </h4>
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      {generatedOptions.length} Opsi Tersedia
                    </span>
                  </div>

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

                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                          &quot;{opt.text}&quot;
                        </p>

                        {optionHasPlaceholder(opt) && (
                          <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                            <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Ada placeholder angka — isi dengan data aslimu sebelum dipakai (anti-fabrication).</span>
                          </div>
                        )}

                        {opt.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic">{opt.notes}</p>
                        )}

                        {opt.bullets?.some((b) => b.keywords_used && b.keywords_used.length > 0) && (
                          <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(opt.bullets.flatMap((b) => b.keywords_used || []))).slice(0, 8).map((kw) => (
                              <span
                                key={kw}
                                className="px-1.5 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(opt)}
                            className="px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer border-0"
                          >
                            <span>Gunakan Poin Ini</span>
                            
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          {isSummary ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {generatedOptions.length > 0 && (
                  <button
                    type="button"
                    disabled={isLoadingAi}
                    onClick={() => handleStartAiProcess()}
                    className="px-3.5 py-2.5 rounded-[10px] bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>Susun Alternatif Baru</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-1.5 cursor-pointer border-0"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Selesai</span>
                </button>
              </div>
            </>
          ) : (
            <>
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
                    onClick={() => handleStartAiProcess()}
                    className="px-6 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs shadow-md shadow-[#1738D1]/20 transition flex items-center gap-2 cursor-pointer border-0"
                  >
                    <TargetIcon className="w-4 h-4 fill-white" />
                    <span>Proses Sekarang</span>
                  </button>
                </>
              )}

              {step === 'results' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartAiProcess()}
                    className="px-4 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCwIcon className="w-3.5 h-3.5" />
                    <span>Susun Ulang AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="px-4 py-2.5 rounded-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    <span>Ubah Strategi</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
