'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  PlusCircle,
  Clock,
  Send,
  Loader2,
  ChevronRight,
  UserCheck,
  Target,
  RotateCcw,
} from 'lucide-react';
import { cvApi, trackerApi } from '@/lib/api';
import { generateAISuggestions, getSuggestionActionUrl } from '@/lib/ai-suggestions';

interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
}

/**
 * Pembersih dan formatter teks respon Konsultan Karir:
 * 1. Buang seluruh karakter emoji dan emotikon.
 * 2. Escape karakter HTML agar bebas injeksi script/XSS.
 * 3. Ubah penanda markdown **bold** menjadi elemen <strong> bercetak tebal sungguhan.
 */
const renderBotText = (rawText: string): string => {
  if (!rawText) return '';

  // 1. Strip all unicode emojis and emoticons
  const noEmoji = rawText.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
    ''
  );

  // 2. Escape HTML
  const escaped = noEmoji
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 3. Render **bold** as bold <strong>
  const boldFormatted = escaped.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold text-white">$1</strong>'
  );

  return boldFormatted;
};

export const AICareerAssistantCard: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    title: string;
    desc: string;
    action: string;
    icon: any;
  }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'advisor',
      text: 'Halo! Saya Konsultan Karir pribadimu di Employr. Berdasarkan analisis profil dan tren rekrutmen terkini, saya siap membantu review CV, latihan wawancara, atau strategi melamar kerja. Silakan pilih topik rekomendasi di atas atau ketik pertanyaanmu.',
      timestamp: 'Sekarang',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

        const formattedSuggestions = generated.map((s) => ({
          ...s,
          icon: iconMap[s.icon] || PlusCircle,
        }));

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('[AICareerAssistantCard] Failed to generate suggestions:', error);
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

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || prompt).trim();
    if (!query || loading) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          promptName: 'Konsultan Karir Personal',
          contextKey: 'general',
          systemInstruction:
            'Anda adalah Konsultan Karir profesional di Indonesia. Berikan saran karir, masukan CV, strategi wawancara, atau rekomendasi perbaikan profil yang sangat konkret, ramah, dan solutif dalam Bahasa Indonesia (maksimal 3 paragraf ringkas). Dilarang keras menggunakan emoji atau emotikon apapun.',
        }),
      });

      const data = await res.json();
      const botResponseText = data.text || data.error || 'Maaf, terjadi kendala saat menyusun rekomendasi karir.';

      const advisorMsg: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: 'advisor',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'advisor',
        text: 'Gagal terhubung dengan Konsultan Karir. Silakan periksa koneksi dan coba lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'advisor',
        text: 'Percakapan telah direset. Ada hal seputar persiapan karir atau CV yang ingin kamu tanyakan?',
        timestamp: 'Sekarang',
      },
    ]);
  };

  return (
    <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 rounded-[10px] p-5 text-white border border-slate-800/80 shadow-lg flex flex-col justify-between h-full space-y-3">
      {/* Header Bento */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#1738D1] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Konsultan Karir (Personal Advisor)
                </h3>
                <span className="px-2 py-0.5 rounded-[10px] text-[9px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                  Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Rekomendasi otomatis berbasis analisis profil &amp; tren rekrutmen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer border-0 flex items-center gap-1 text-[10px]"
            title="Mulai percakapan baru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Suggested Topic Chips (Rekomendasi Otomatis) */}
        <div className="pt-2.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Rekomendasi Cepat Berbasis Profil:</span>
            <span className="text-[9px] text-slate-500 font-normal">Klik untuk tanya</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {isLoadingSuggestions ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-2 rounded-[8px] bg-white/5 border border-white/10 space-y-1.5 animate-pulse">
                  <div className="h-3 w-16 bg-white/10 rounded" />
                  <div className="h-2.5 w-full bg-white/10 rounded" />
                </div>
              ))
            ) : (
              suggestions.map((s, idx) => {
                const Icon = s.icon;
                const actionUrl = getSuggestionActionUrl(s);

                return (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(`Tolong berikan panduan konkret langkah demi langkah untuk: ${s.title}`)}
                    className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-left transition group cursor-pointer flex flex-col justify-between"
                    title="Klik untuk langsung menanyakan panduan topik ini"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <h4 className="font-bold text-[11px] text-white line-clamp-1 group-hover:text-orange-300 transition">
                          {s.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(actionUrl);
                        }}
                        className="text-[9px] font-bold text-orange-400 hover:text-orange-300 px-1.5 py-0.5 rounded-[4px] bg-orange-500/10 hover:bg-orange-500/20 transition flex items-center gap-0.5 cursor-pointer border-0 shrink-0"
                        title={`Buka ${s.action}`}
                      >
                        {s.action}
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">
                      {s.desc}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto pr-1 space-y-2.5 rounded-[10px] bg-slate-950/70 p-3 border border-white/10">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start items-start gap-2'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-[#1738D1] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`p-2.5 rounded-[10px] text-xs shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#1738D1] text-white rounded-tr-none font-medium max-w-[85%]'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none max-w-[90%]'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div
                    className="whitespace-pre-wrap space-y-1.5 text-slate-200"
                    dangerouslySetInnerHTML={{ __html: renderBotText(msg.text) }}
                  />
                )}
                <span
                  className={`block text-[9px] mt-1 ${
                    isUser ? 'text-orange-200 text-right' : 'text-slate-500 text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-[#1738D1] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="p-2.5 rounded-[10px] rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400">
                Konsultan Karir sedang menganalisis...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="bg-slate-950/80 p-2.5 rounded-[10px] border border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Tanya Konsultan Karir:
          </label>
          <span className="text-[9px] text-slate-500">
            {prompt.length}/500
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            maxLength={500}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder="Contoh: Bagaimana cara negosiasi gaji pertama untuk fresh graduate?"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-[10px] px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-400 transition"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer border-0 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>Kirim</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
