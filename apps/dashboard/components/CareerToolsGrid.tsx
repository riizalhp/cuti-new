'use client';

import React, { useState } from 'react';
import {
  Search,
  FileText,
  MessageSquare,
  Mail,
  Mic,
  Sparkles,
  ArrowRight,
  X,
  Loader2,
  Copy,
  Check,
  Zap,
  Linkedin,
} from 'lucide-react';

export const CareerToolsGrid: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'job-analysis',
      name: 'Job Analysis',
      desc: 'Analisis kecocokan CV kamu dengan syarat deskripsi pekerjaan.',
      icon: Search,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400',
      badge: 'Bagus untuk Match',
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Builder',
      desc: 'Buat surat lamaran kerja profesional otomatis berbasis AI.',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400',
      badge: 'Auto Generate',
    },
    {
      id: 'wa-builder',
      name: 'WA Builder',
      desc: 'Draf pesan WhatsApp sopan & profesional untuk follow-up HR.',
      icon: MessageSquare,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400',
      badge: 'Pesan Instan',
    },
    {
      id: 'email-builder',
      name: 'Email Builder',
      desc: 'Format email lamaran lengkap subject, isi & lampiran rapi.',
      icon: Mail,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400',
      badge: 'Standard HR',
    },
    {
      id: 'interview-guide',
      name: 'Interview Guide',
      desc: 'Simulasi & kisi-kisi jawaban pertanyaan wawancara tersering.',
      icon: Mic,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400',
      badge: 'Simulator AI',
    },
    {
      id: 'linkedin-analyzer',
      name: 'LinkedIn Headline Generator',
      desc: 'Buat Headline & Bio LinkedIn persuasif yang disukai Recruiter.',
      icon: Linkedin,
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400',
      badge: 'Recruiter SEO',
    },
  ];

  const handleOpenTool = (toolId: string) => {
    setActiveTool(toolId);
    setInputVal('');
    setOutputVal('');
  };

  const handleGenerateTool = async () => {
    if (!inputVal.trim()) return;
    setLoading(true);

    let systemInstruction = '';
    let promptText = '';

    if (activeTool === 'job-analysis') {
      systemInstruction = 'Anda adalah spesialis analisis rekrutmen ATS. Analisis deskripsi lowongan berikut dan berikan skor kecocokan (Match Score), kata kunci penting yang harus ditambahkan ke CV, dan saran perbaikan.';
      promptText = `Deskripsi Pekerjaan / Kualifikasi:\n${inputVal}`;
    } else if (activeTool === 'cover-letter') {
      systemInstruction = 'Anda adalah pembuat Surat Lamaran Kerja (Cover Letter) profesional. Buat surat lamaran yang sangat persuasif, formal, ramah, dan terstruktur sesuai standar perusahaan di Indonesia.';
      promptText = `Detail Posisi & Perusahaan:\n${inputVal}`;
    } else if (activeTool === 'wa-builder') {
      systemInstruction = 'Buatkan 2 contoh draf pesan WhatsApp yang sangat sopan, profesional, dan ringkas untuk dikirim kepada HR/Recruiter (contoh: Konfirmasi interview / Follow up lamaran).';
      promptText = `Konteks Pesan WA:\n${inputVal}`;
    } else if (activeTool === 'email-builder') {
      systemInstruction = 'Buatkan format Email Lamaran Kerja lengkap dengan Subject Line, Salutation, Isi Body Email profesional, dan daftar lampiran file.';
      promptText = `Posisi yang dilamar & nama perusahaan:\n${inputVal}`;
    } else if (activeTool === 'interview-guide') {
      systemInstruction = 'Anda adalah Interview Coach profesional. Berikan 3 pertanyaan interview paling sering ditanyakan untuk posisi ini, beserta metode STAR (Situation, Task, Action, Result) untuk menjawabnya dengan sempurna.';
      promptText = `Posisi Pekerjaan:\n${inputVal}`;
    } else if (activeTool === 'linkedin-analyzer') {
      systemInstruction = 'Anda adalah Konsultan Personal Branding LinkedIn Senior. Buatkan 3 pilihan Headline LinkedIn bermutu tinggi (High converting) dengan kata kunci terindeks recruiter, draf ringkas bagian About, dan 5 hashtag relevan.';
      promptText = `Target Karir & Keahlian:\n${inputVal}`;
    }

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setOutputVal(data.text);
      } else {
        setOutputVal('Gagal menghasilkan draf. Silakan coba lagi.');
      }
    } catch (err) {
      setOutputVal('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 border border-white/30 dark:border-white/10 shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
            Fitur &amp; Alat Bantu Karir (AI Tools)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Percepat proses melamar kerja dengan alat otomatis
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          5 Tools Siap Pakai
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleOpenTool(t.id)}
              className="p-4 rounded-[22px] border border-white/40 dark:border-white/10 bg-white/30 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-md transition-all text-left flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${t.color} backdrop-blur-sm shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/40 dark:border-white/10">
                    {t.badge}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {t.desc}
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-white/20 dark:border-white/10 flex items-center justify-between text-[11px] font-black text-violet-600 dark:text-violet-400">
                <span>Gunakan Tool</span>
                <span className="w-5 h-5 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card border border-white/30 dark:border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] bg-white/90 dark:bg-slate-900/90">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/20 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {tools.find((t) => t.id === activeTool)?.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/20 dark:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Masukkan Informasi / Deskripsi Lowongan:
                </label>
                <textarea
                  rows={4}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Contoh: Lowongan Admin Penjualan di PT Maju Bersama, kualifikasi: Menguasai Excel, komunikasi baik, lokasi Jakarta Pusat..."
                  className="w-full bg-white/40 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 backdrop-blur-md resize-none"
                ></textarea>
              </div>

              <button
                onClick={handleGenerateTool}
                disabled={loading || !inputVal.trim()}
                className="w-full group btn-neo-skeuo-accent py-3 px-4 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses AI...</span>
                  </>
                ) : (
                  <>
                    <span>Hasikan Draf Otomatis</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-105 transition">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </span>
                  </>
                )}
              </button>

              {outputVal && (
                <div className="space-y-2 pt-3 border-t border-white/20 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Hasil Generasi AI:
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Hasil</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto backdrop-blur-md">
                    {outputVal}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
