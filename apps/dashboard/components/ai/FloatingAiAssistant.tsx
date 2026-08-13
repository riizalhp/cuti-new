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

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Halo, saya Herdi dari Customer Service AmbilCUTI. Ada yang bisa saya bantu terkait penggunaan sistem, panduan fitur, atau kendala yang sedang kamu alami?',
      timestamp: 'Baru saja',
    },
  ]);

  const quickChips = [
    'Cara cetak CV ke PDF',
    'Kendala pembayaran',
    'Panduan Misi dan Referral',
  ];

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

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          systemInstruction:
            'Nama Anda adalah Herdi, Customer Service AmbilCUTI yang sangat ramah, sopan, hangat, dan solutif. Tugas Anda adalah membantu pengguna memahami cara menggunakan fitur platform (CV Builder, Tracker, Misi Cuan, Referral, Pembayaran), memberikan panduan pencetakan PDF via Ctrl+P, serta memberikan solusi jika terjadi error atau kendala teknis. Jawablah dalam Bahasa Indonesia yang santun, jelas, dan sangat ramah. DILARANG EMOJI: Jangan pernah menggunakan emoji atau emoticon dalam bentuk apapun.',
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.text || 'Maaf, terjadi masalah saat memproses pertanyaan kamu. Silakan periksa koneksi internet atau coba beberapa saat lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
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
    <div ref={containerRef} className="fixed z-40 right-2 bottom-3 md:right-4 md:bottom-5 pointer-events-auto select-none">
      {isExpanded ? (
        /* MINI CHAT ROOM POPUP WIDGET */
        <div className="w-[310px] sm:w-[350px] h-[430px] sm:h-[470px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Mini Chat Room Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full border border-purple-400 overflow-hidden shrink-0 shadow-xs">
                <img
                  src="/images/tokoh-1.png"
                  alt="Herdi CS"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5 leading-tight">
                  <span>Herdi</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300 font-medium">
                  Customer Service AmbilCUTI
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
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
                    <div className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-2.5 rounded-2xl space-y-1 shadow-xs ${
                      isBot
                        ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                        : 'bg-purple-600 text-white rounded-tr-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <span
                      className={`block text-[9px] ${
                        isBot ? 'text-slate-400 dark:text-slate-500' : 'text-purple-200'
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
                <div className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Herdi sedang mengetik balasan...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isTyping}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer"
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
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition cursor-pointer shrink-0"
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
            className={`relative cursor-pointer mb-0.5 mr-8 sm:mr-12 max-w-[150px] sm:max-w-[175px] px-3 py-2 rounded-2xl rounded-br-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-100 transition-all duration-300 ease-out origin-bottom-right group ${
              isBubbleVisible
                ? 'opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-50 translate-x-3 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 animate-pulse" />
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
            <img
              src="/images/tokoh-1.png"
              alt="Herdi Customer Service"
              className="w-16 sm:w-20 md:w-24 h-auto drop-shadow-2xl object-contain"
            />
            {/* Online Status Indicator */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md" />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
          </button>

          {/* BASE PEDESTAL ACCENT LINE IN FRONT OF IMAGE (Z-20 OVERLAY, PERFECT SWEET SPOT) */}
          <div className="relative z-20 w-12 sm:w-16 h-1 sm:h-1.5 mr-2 sm:mr-3 ml-auto -mt-0.5 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-md shadow-purple-500/80 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
