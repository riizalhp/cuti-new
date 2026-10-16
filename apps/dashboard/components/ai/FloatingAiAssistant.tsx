'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
 * ubah penanda **bold** menjadi <strong>, dan jadikan tautan resmi aktif.
 */
const renderBotText = (text: string): string => {
  if (!text) return '';
  const escaped = escapeHtml(text);
  let formatted = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Format tautan Pusat Bantuan (faq.employr.id/artikel/...)
  formatted = formatted.replace(
    /(?:https?:\/\/)?(faq\.employr\.id\/artikel\/[a-z0-9-]+)/gi,
    '<a href="https://$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-cobalt-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80 cursor-pointer">$1</a>'
  );

  // Format email bantuan resmi
  formatted = formatted.replace(
    /(help\.employr@outlook\.com)/gi,
    '<a href="mailto:$1" class="font-semibold text-cobalt-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80 cursor-pointer">$1</a>'
  );

  return formatted;
};


export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = () => {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      text: 'Halo! Lagi butuh info apa di Employr? Ketik aja pertanyaan atau kendala yang kamu alami (misal: cetak CV, tracker lamaran, career intelligence, atau draf email), nanti aku carikan panduan resminya ya.',
      timestamp: 'Baru saja',
    },
  ]);

  const quickChips = [
    'Cara cetak CV ke PDF',
    'Tambah lamaran di Tracker',
    'Career Intelligence',
    'Draf Email Lamaran',
    'Persiapan Offering',
  ];


  // Dynamic Base URL situs FAQ
  const faqBaseUrl = getFaqUrl();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('employr_cs_dismissed') === 'true') {
          setIsDismissed(true);
        }
      } catch {}
    }

    const handleRestoreHerdi = () => {
      setIsDismissed(false);
      setIsExpanded(true);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('employr_cs_dismissed');
        } catch {}
      }
    };

    window.addEventListener('employr:restore-herdi', handleRestoreHerdi);
    return () => {
      window.removeEventListener('employr:restore-herdi', handleRestoreHerdi);
    };
  }, []);

  const handleDismiss = () => {
    setIsExpanded(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('employr_cs_dismissed', 'true');
      } catch {}
    }
  };

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
        if (isMenuOpen) {
          setIsMenuOpen(false);
          return;
        }
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
          'Maaf, terjadi kendala saat mencari jawaban. Coba periksa koneksi internet atau ulangi beberapa saat lagi ya.',
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
        text: 'Koneksi ke Pusat Bantuan lagi terganggu nih. Coba kirim ulang pesanmu sebentar lagi ya.',
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

  // Modal / Bottom Sheet Chat Dialog
  const chatDialog = isExpanded ? (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs sm:hidden animate-in fade-in duration-200"
        onClick={() => setIsExpanded(false)}
        aria-hidden="true"
      />

      {/* Dialog Container: Mobile = Bottom Sheet, Desktop = Corner Floating Box */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Customer Service Herdi"
        className={cn(
          // Mobile (< 640px): Adaptive Bottom Sheet meluncur dari bawah
          'fixed inset-x-0 bottom-0 z-50 h-[88dvh] max-h-[88dvh] w-full rounded-t-[16px] rounded-b-none border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300',
          // Desktop (>= 640px): Floating widget di pojok kanan bawah
          'sm:fixed sm:inset-auto sm:right-5 sm:bottom-5 sm:w-[360px] sm:h-[480px] sm:max-h-[90vh] sm:rounded-[10px] sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:shadow-2xl sm:animate-in sm:fade-in sm:zoom-in-95'
        )}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Mini Chat Room Header */}
        <div className="relative p-3 sm:p-3.5 bg-navy-700 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
          {/* Identitas Herdi */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full border border-orange-400 overflow-hidden shrink-0 shadow-xs">
              <img
                src="/images/mascot-1.webp"
                alt="Herdi CS"
                className="w-full h-full object-cover scale-[1.65] origin-top translate-y-0.5"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white leading-none">Herdi</h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                Customer Service Employr
              </p>
            </div>
          </div>

          {/* Aksi Header: Menu Opsi + Tombol Tutup */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Tombol Menu Opsi (Titik Tiga) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full hover:bg-white/10 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Opsi Bantuan"
                aria-label="Opsi Bantuan"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </button>

              {/* Dropdown Menu Opsi */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-10 z-50 w-48 rounded-[10px] bg-slate-900 border border-slate-700 shadow-xl py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <a
                      href={`${faqBaseUrl}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
                    >
                      <span className="font-semibold">Pusat Bantuan</span>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleDismiss();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer border-t border-slate-800"
                    >
                      <span className="font-semibold">Sembunyikan Herdi</span>
                      <CloseIcon size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Tombol Tutup Chat Room (Selalu terlihat & lega) */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full hover:bg-white/15 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Tutup Chat"
              aria-label="Tutup Chat Room"
            >
              <CloseIcon size={16} />
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
                    className={`max-w-[85%] p-2.5 rounded-[10px] space-y-1 shadow-xs animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none ${
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
              <div className="flex items-center text-slate-500 justify-start dark:text-slate-400 animate-in fade-in duration-150 motion-reduce:animate-none">
                <div className="px-3 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                  {/* Animasi memproses panduan: 3 titik memantul bergantian */}
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce motion-reduce:animate-none"
                        style={{ animationDelay: `${-i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-caption font-semibold text-slate-500 dark:text-slate-400">
                    Herdi sedang menyiapkan panduan...
                  </span>
                </div>
              </div>
            )}
          </div>
        </AIConversation>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(suggestionChips.length > 0 ? suggestionChips : quickChips).map((chip, idx) => (
            <button
              key={`${chip}-${idx}`}
              type="button"
              onClick={() => handleSendMessage(chip)}
              disabled={isTyping}
              className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300 text-caption font-bold border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer min-h-[36px]"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Mini Chat Input Footer with Safe Area */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
            aria-label="Tuliskan pertanyaan atau kendala kamu"
            placeholder="Tuliskan pertanyaan atau kendala kamu..."
            className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cobalt-500 transition"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] bg-cobalt-500 hover:bg-cobalt-600 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition cursor-pointer shrink-0 border-0"
            title="Kirim Pesan"
            aria-label="Kirim Pesan"
          >
            {isTyping ? (
              <LoaderIcon size={16} className="animate-spin" />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Jika chat terbuka, render portal ke body agar bebas transform/scale layout */}
      {isExpanded && mounted && typeof document !== 'undefined'
        ? createPortal(chatDialog, document.body)
        : null}

      {/* FAB Customer Service (Hanya tampil saat chat tertutup) */}
      {!isExpanded && (
        <div
          className={cn(
            'fixed z-40 right-3 bottom-[calc(74px+env(safe-area-inset-bottom,0px))] md:right-5 md:bottom-5 pointer-events-auto select-none transition-all duration-300',
            isScrolling ? 'opacity-25 scale-90 pointer-events-none' : 'opacity-100 scale-100'
          )}
        >
          <div className="relative group">
            {/* Tombol Utama Avatar Herdi: min 48x48px (Memenuhi WCAG AA & Auditor) */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-expanded={false}
              aria-haspopup="dialog"
              className="group relative min-w-[48px] min-h-[48px] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navy-800 hover:bg-navy-900 border-2 border-orange-400 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer p-0.5 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-orange-400/20"
              title="Tanya Herdi (Customer Service)"
              aria-label="Tanya Herdi"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden bg-navy-900">
                <Image
                  src="/images/mascot-1.webp"
                  alt="Herdi"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover scale-[1.65] origin-top translate-y-1 group-hover:scale-[1.75] transition-transform duration-200"
                />
              </div>
              {/* Online Status Indicator */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
            </button>

            {/* Quick Dismiss Button (Desktop/Hover & Keyboard Focus - 44x44px hitbox) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              title="Sembunyikan CS"
              aria-label="Sembunyikan customer service"
              className="absolute -top-3 -left-3 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity z-10 cursor-pointer pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto"
            >
              <span className="w-6 h-6 rounded-full bg-slate-900/90 hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-xs">
                <CloseIcon size={12} />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
