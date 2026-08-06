'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  PlusCircle,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const AICareerAssistantCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const initialSuggestions = [
    {
      title: 'Tambahkan Skill Teknis React & Next.js',
      desc: '70% lowongan IT di Jabodetabek membutuhkan keahlian framework modern.',
      icon: PlusCircle,
      action: 'Tambah Skill',
    },
    {
      title: 'Lengkapi Pengalaman Magang / Project',
      desc: 'Sebutkan hasil kuantitatif (contoh: meningkatkan performa 30%).',
      icon: UserCheck,
      action: 'Lengkapi Now',
    },
    {
      title: 'Waktu Terbaik Melamar: Selasa Jam 09:00',
      desc: 'Rasio tanggapan HR meningkat pesat di awal minggu jam kerja.',
      icon: Clock,
      action: 'Set Reminder',
    },
  ];

  const handleConsult = async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          systemInstruction:
            'Anda adalah Asisten Karir AI profesional di Indonesia. Berikan saran karir, masukan CV, strategi wawancara, atau rekomendasi perbaikan profil yang sangat konkret, ramah, dan solutif dalam Bahasa Indonesia (maksimal 3 paragraf ringkas).',
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse(`Maaf, terjadi masalah: ${data.error}`);
      }
    } catch (err: unknown) {
      setAiResponse('Gagal terhubung dengan Asisten AI Karir. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D3BD9] rounded-xl p-5 md:p-6 text-white border border-blue-500/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B33BD] flex items-center justify-center text-white font-bold shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">
                Asisten Karir AI (Personal Advisor)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                Active AI
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Rekomendasi otomatis berbasis analisis profil &amp; tren rekrutmen 2026
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Personal Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {initialSuggestions.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => handleConsult(`Tolong berikan detail panduan untuk: ${s.title}`)}
              className="p-3.5 rounded-lg bg-[#071E6C] border border-blue-400/30 text-left hover:border-blue-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-amber-300" />
                  <span className="text-[10px] font-bold text-blue-200 group-hover:text-white transition flex items-center gap-1">
                    {s.action}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white mb-1">{s.title}</h4>
                <p className="text-[11px] text-slate-300 leading-snug">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom AI Prompt Box */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-violet-800/60">
        <label className="block text-[11px] font-bold text-violet-200 uppercase tracking-wider mb-2">
          Tanyakan Apapun Pada Asisten Karir AI:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
            placeholder="Contoh: Bagaimana cara negosiasi gaji $1000/bulan untuk posisi Junior Web Dev?"
            className="flex-1 bg-slate-900 border border-violet-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
          />
          <button
            onClick={() => handleConsult()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Tanya AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Output Box */}
        {aiResponse && (
          <div className="mt-3 p-3.5 rounded-lg bg-violet-950/80 border border-violet-600/50 text-xs text-violet-100 leading-relaxed max-h-60 overflow-y-auto">
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Saran Asisten Karir AI:</span>
            </div>
            <div className="whitespace-pre-wrap">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
};
