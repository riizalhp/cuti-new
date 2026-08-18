'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  Bot,
} from 'lucide-react';

export interface FloatingAiAssistantProps {
  atsScore?: number;
  onOpenGlobalOptimize?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

/**
 * Render teks balasan bot: ubah penanda **bold** menjadi <strong> sungguhan
 * (tanpa tanda bintang), sehingga judul artikel tampil tebal secara natural.
 */
const renderBotText = (text: string): string => {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionChips, setSuggestionChips] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Halo, saya Herdi dari Customer Service Employr. Ada yang bisa saya bantu terkait penggunaan sistem, panduan fitur, atau kendala yang sedang kamu alami? Jawaban saya ambil otomatis dari Pusat Bantuan Employr (faq.employr.id).',
      timestamp: 'Baru saja',
    },
  ]);

  const quickChips = [
    'Cara cetak CV ke PDF',
    'Kendala pembayaran',
    'Panduan Misi dan Referral',
  ];

  // Base URL situs FAQ (faq.employr.id). Bisa di-override lewat env untuk staging/dev.
  const faqBaseUrl =
    process.env.NEXT_PUBLIC_FAQ_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://faq.employr.id' : 'http://localhost:3005');

  // Click outside listener to auto-close chat room when clicking outside area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 450);
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    const scrollContainer = document.getElementById('main-content-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (isExpanded && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isExpanded]);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = customPrompt || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsTyping(true);
    setSuggestionChips([]);
    const startedAt = Date.now();

    try {
      // Retrieval-based (RAG tanpa LLM): jawaban diambil dari Pusat Bantuan via /api/faq-chat
      const res = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      // Pastikan animasi mengetik terlihat sebentar sebelum jawaban muncul
      const minTypingMs = 900;
      const elapsed = Date.now() - startedAt;
      if (elapsed < minTypingMs) {
        await new Promise((resolve) => setTimeout(resolve, minTypingMs - elapsed));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text:
          data.text ||
          'Maaf, terjadi masalah saat mencari jawaban. Silakan periksa koneksi internet atau coba beberapa saat lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Tampilkan artikel terkait sebagai chip saran lanjutan
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestionChips(data.suggestions.slice(0, 3));
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Maaf, koneksi ke layanan customer service terganggu. Silakan coba kembali beberapa saat lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isDismissed) return null;

  const isBubbleVisible = !isScrolling && !isExpanded;

  return (
    <div ref={containerRef} className="fixed z-40 right-2 bottom-18 md:right-4 md:bottom-5 pointer-events-auto select-none">
      {isExpanded ? (
        /* MINI CHAT ROOM POPUP WIDGET */
        <div className="w-[310px] sm:w-[350px] h-[430px] sm:h-[470px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Mini Chat Room Header */}
          <div className="p-3.5 bg-navy-700 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full border border-orange-400 overflow-hidden shrink-0 shadow-xs">
                <img
                  src="/images/mascot-1.webp"
                  alt="Herdi CS"
                  className="w-full h-full object-cover scale-[2.1] origin-top translate-y-1"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5 leading-tight">
                  <span>Herdi</span>
                  <span className="px-1.5 py-0.2 rounded-[10px] bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-slate-200 font-medium">
                  Customer Service Employr
                </p>
              </div>
              <a
                href={`${faqBaseUrl}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-200 hover:text-white underline underline-offset-2 transition shrink-0"
              >
                Pusat Bantuan
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title="Tutup Chat Room"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Chat Messages Body */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50 text-xs no-scrollbar"
          >
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300 border border-navy-200 dark:border-navy-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-2.5 rounded-[10px] space-y-1 shadow-xs ${
                      isBot
                        ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                        : 'bg-[#1738D1] text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {isBot ? (
                      <p
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderBotText(msg.text) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                    <span
                      className={`block text-[9px] ${
                        isBot ? 'text-slate-400 dark:text-slate-500' : 'text-orange-100'
                      } text-right`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400">
                <div className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 dark:bg-navy-950 dark:text-navy-300 border border-navy-200 dark:border-navy-800 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  {/* Animasi mengetik: 3 titik memantul bergantian */}
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                        style={{ animationDelay: `${-i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Herdi sedang mengetik...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips (statis + dinamis dari jawaban bot) */}
          <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {(suggestionChips.length > 0 ? suggestionChips : quickChips).map((chip, idx) => (
              <button
                key={`${chip}-${idx}`}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isTyping}
                className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Mini Chat Input Footer */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
              placeholder="Tuliskan pertanyaan atau kendala kamu..."
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1738D1] transition"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="w-8 h-8 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition cursor-pointer shrink-0 border-0"
              title="Kirim Pesan"
            >
              {isTyping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* FLOATING NATURAL IMAGE WITH TOP-LEFT SPEECH BUBBLE MATCHING USER SKETCH */
        <div className="relative flex flex-col items-end">
          {/* CHAT SPEECH BUBBLE WITH SMOOTH SCROLL FADE/SCALE ANIMATION */}
          <div
            onClick={() => setIsExpanded(true)}
            className={`relative cursor-pointer mb-0.5 mr-8 sm:mr-12 max-w-[150px] sm:max-w-[175px] px-3 py-2 rounded-[10px] rounded-br-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-100 transition-all duration-300 ease-out origin-bottom-right group ${
              isBubbleVisible
                ? 'opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-50 translate-x-3 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1738D1] shrink-0 animate-pulse" />
              <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-100">
                Ada kendala atau pertanyaan?
              </p>
            </div>

            {/* Tail pointing down-right towards the character's pointing finger */}
            <div className="absolute -bottom-2.5 right-4 sm:right-6 w-4 h-3 overflow-hidden pointer-events-none">
              <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45 translate-x-0 -translate-y-1.5 shadow-xs" />
            </div>
          </div>

          {/* NATURAL CHARACTER IMAGE BUTTON */}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="group relative focus:outline-none transition-transform duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
            title="Herdi Customer Service"
          >
            <div className="relative">
              <img
                src="/images/mascot-cs.webp"
                alt="Herdi Customer Service"
                className="w-16 sm:w-20 md:w-24 h-auto drop-shadow-2xl object-contain relative z-10"
              />

              {/* Online Status Indicator */}
              <span className="absolute bottom-1 right-1 z-30 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md" />
              <span className="absolute bottom-1 right-1 z-30 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75" />

              {/* BASE PEDESTAL ACCENT LINE IN FRONT OF IMAGE (Z-20 FOREGROUND OVERLAY) */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 w-12 sm:w-16 md:w-18 h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shadow-md shadow-[#1738D1]/90 pointer-events-none ring-1 ring-orange-300/60" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
