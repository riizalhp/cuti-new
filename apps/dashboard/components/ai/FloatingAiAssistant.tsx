'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  CloseIcon,
  SendIcon,
  LoaderIcon,
} from '@/components/icons/CustomIcons';
import { AIConversation } from '@/components/smoothui/ai-conversation';
import { getFaqUrl } from '@/lib/urls';
import { cn } from '@/lib/utils';

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

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Render teks balasan bot: escape seluruh HTML berbahaya untuk mencegah XSS,
 * lalu ubah penanda **bold** menjadi <strong> sungguhan.
 */
const renderBotText = (text: string): string => {
  if (!text) return '';
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Dynamic Base URL situs FAQ
  const faqBaseUrl = getFaqUrl();

  // Focus input when opened
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);

  // Click outside and Escape key listener to close chat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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

  // Key perubahan konten untuk AIConversation auto-scroll logic
  const conversationContentKey =
    messages.length + (isTyping ? 1 : 0) + (messages[messages.length - 1]?.text?.length || 0);

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed z-40 right-3 bottom-[74px] md:right-5 md:bottom-5 pointer-events-auto select-none transition-all duration-300',
        isScrolling && !isExpanded ? 'opacity-30 scale-90 pointer-events-none' : 'opacity-100 scale-100'
      )}
    >
      {isExpanded ? (
        /* MINI CHAT ROOM POPUP WIDGET */
        <div
          role="dialog"
          aria-label="Customer Service Herdi"
          className="w-[310px] sm:w-[350px] h-[430px] sm:h-[470px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
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
                  <span className="px-1.5 py-0.5 rounded-[10px] bg-emerald-500/20 text-emerald-300 text-caption font-bold border border-emerald-500/30">
                    Online
                  </span>
                </h4>
                <p className="text-caption text-slate-200 font-medium">
                  Customer Service Employr
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`${faqBaseUrl}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption font-bold text-blue-200 hover:text-white underline underline-offset-2 transition"
              >
                Pusat Bantuan
              </a>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Tutup Chat Room"
                aria-label="Tutup Chat Room"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          </div>

          {/* Mini Chat Messages Body with SmoothUI AIConversation */}
          <AIConversation
            className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-950/50"
            contentKey={conversationContentKey}
          >
            <div
              aria-live="polite"
              aria-atomic="false"
              className="p-3.5 space-y-3 text-xs"
            >
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-[10px] space-y-1 shadow-xs ${
                        isBot
                          ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                          : 'bg-cobalt-500 text-white rounded-tr-none font-medium'
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
                        className={`block text-caption ${
                          isBot ? 'text-slate-500 dark:text-slate-500' : 'text-orange-100'
                        } text-right`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center text-slate-500 justify-start dark:text-slate-400">
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
                    <span className="text-caption font-semibold text-slate-500 dark:text-slate-400">
                      Herdi sedang mengetik...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </AIConversation>

          {/* Quick Suggestion Chips (statis + dinamis dari jawaban bot) */}
          <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {(suggestionChips.length > 0 ? suggestionChips : quickChips).map((chip, idx) => (
              <button
                key={`${chip}-${idx}`}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isTyping}
                className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300 text-caption font-bold border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Mini Chat Input Footer */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
              aria-label="Tuliskan pertanyaan atau kendala kamu"
              placeholder="Tuliskan pertanyaan atau kendala kamu..."
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cobalt-500 transition"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="w-8 h-8 rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition cursor-pointer shrink-0 border-0"
              title="Kirim Pesan"
              aria-label="Kirim Pesan"
            >
              {isTyping ? (
                <LoaderIcon size={14} className="animate-spin" />
              ) : (
                <SendIcon size={14} />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* FLOATING ACTION BUTTON (FAB) CUSTOMER SERVICE */
        <div className="relative group">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-expanded={isExpanded}
            aria-haspopup="dialog"
            className="group relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-navy-800 hover:bg-navy-900 border-2 border-orange-400 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer p-0.5 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-orange-400/20"
            title="Tanya Herdi (Customer Service)"
            aria-label="Tanya Herdi"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-navy-900">
              <Image
                src="/images/mascot-1.webp"
                alt="Herdi"
                width={52}
                height={52}
                className="w-full h-full object-cover scale-[2.1] origin-top translate-y-1 group-hover:scale-[2.2] transition-transform duration-200"
              />
            </div>
            {/* Online Status Indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
          </button>

          {/* Quick Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            title="Sembunyikan CS"
            aria-label="Sembunyikan customer service"
            className="absolute -top-2 -left-2 w-8 h-8 min-w-[28px] min-h-[28px] rounded-full bg-slate-900/90 hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10 cursor-pointer shadow-xs"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
