'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  Clock,
  Send,
  Loader2,
  ChevronRight,
  UserCheck,
  Target,
} from 'lucide-react';
import { cvApi, trackerApi } from '@/lib/api';
import { generateAISuggestions, getSuggestionActionUrl } from '@/lib/ai-suggestions';

export const AICareerAssistantCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    desc: string;
    action: string;
    icon: any;
  }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const cvs = await cvApi.getAll();
        const applications = await trackerApi.getAll();

        const profile = { cvs, applications };
        const generated = generateAISuggestions(profile);

        const iconMap: Record<string, any> = {
          PlusCircle,
          UserCheck,
          Clock,
          Sparkles,
          Target,
        };

        const formattedSuggestions = generated.map(s => ({
          ...s,
          icon: iconMap[s.icon] || PlusCircle,
        }));

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('[AICareerAssistantCard] Failed to generate suggestions:', error);
        // Fallback suggestions
        setSuggestions([
          {
            title: 'Lengkapi Profil CV Kamu',
            desc: 'CV yang lengkap meningkatkan peluang lolos screening HR.',
            action: 'Lengkapi CV',
            icon: PlusCircle,
          },
          {
            title: 'Mulai Kirim Lamaran',
            desc: 'Target 5-10 lamaran per minggu untuk hasil optimal.',
            action: 'Cari Lowongan',
            icon: Target,
          },
        ]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestions();
  }, []);

  const handleConsult = async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          systemInstruction:
            'Anda adalah Konsultan Karir profesional di Indonesia. Berikan saran karir, masukan CV, strategi wawancara, atau rekomendasi perbaikan profil yang sangat konkret, ramah, dan solutif dalam Bahasa Indonesia (maksimal 3 paragraf ringkas).',
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse(`Maaf, terjadi masalah: ${data.error}`);
      }
    } catch (err: unknown) {
      setAiResponse('Gagal terhubung dengan Konsultan Karir. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 rounded-[10px] p-5 md:p-6 text-white border border-slate-800/80 shadow-lg flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Konsultan Karir (Personal Advisor)
                </h3>
                <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                  Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Rekomendasi otomatis berbasis analisis profil &amp; tren rekrutmen
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Personal Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {isLoadingSuggestions ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-[10px] bg-white/5 border border-white/10 space-y-2 animate-pulse">
                <div className="h-4 w-4 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/10 rounded" />
                <div className="h-3 w-3/4 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            suggestions.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleConsult(`Tolong berikan detail panduan untuk: ${s.title}`)}
                  className="p-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-left transition group flex flex-col justify-between space-y-2 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition flex items-center gap-1">
                        {s.action}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white mb-1 line-clamp-1">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{s.desc}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Consultation Prompt Box */}
      <div className="bg-slate-950/80 p-3 rounded-[10px] border border-white/10">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tanyakan Apapun Pada Konsultan Karir:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
            placeholder="Contoh: Bagaimana cara nego gaji untuk posisi Junior Web Dev?"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-[10px] px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
          />
          <button
            onClick={() => handleConsult()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer border-0 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Tanya</span>
              </>
            )}
          </button>
        </div>

        {/* Output Box */}
        {aiResponse && (
          <div className="mt-3 p-3.5 rounded-[10px] bg-slate-900 border border-white/10 text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-orange-400 font-bold mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Rekomendasi Konsultan Karir:</span>
            </div>
            <div className="whitespace-pre-wrap text-slate-300">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
};
