"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, Send, X, Loader2, ArrowUpRight } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  slug?: string | null;
  title?: string | null;
}

const DEFAULT_CHIPS = [
  "Cara cetak CV ke PDF",
  "Tracker lamaran",
  "Evaluasi CV",
  "Kendala umum",
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMessageHtml(text: string): string {
  if (!text) return "";
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return formatted;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chips, setChips] = useState<string[]>(DEFAULT_CHIPS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      sender: "bot",
      text: "Halo, saya Herdi dari Customer Service Employr. Ada yang bisa saya bantu terkait pembuatan CV, tracker lamaran, evaluasi berkas, atau kendala fitur?",
      timestamp: "Baru saja",
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Listener event global untuk membuka chat dari tombol mana saja
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.query) {
        handleSend(customEvent.detail.query);
      }
    };

    window.addEventListener("open-faq-chat", handleOpenChat);
    return () => {
      window.removeEventListener("open-faq-chat", handleOpenChat);
    };
  }, []);

  const handleSend = async (queryText?: string) => {
    const query = (queryText ?? inputText).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputText("");
    setIsTyping(true);
    setChips([]);

    const startedAt = Date.now();

    try {
      const res = await fetch("/api/faq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      // Beri sedikit jeda alami jika response terlalu instan (< 600ms)
      const elapsed = Date.now() - startedAt;
      if (elapsed < 600) {
        await new Promise((resolve) => setTimeout(resolve, 600 - elapsed));
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text:
          data.text ||
          "Maaf, jawaban untuk pertanyaan tersebut belum ditemukan di dokumentasi. Kamu dapat mencoba kata kunci lain atau mencari melalui kolom pencarian.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        slug: data.slug || null,
        title: data.title || null,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setChips(data.suggestions.slice(0, 3));
      } else {
        setChips(DEFAULT_CHIPS);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Maaf, koneksi ke sistem bantuan sedang terputus. Silakan coba kembali beberapa saat lagi.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setChips(DEFAULT_CHIPS);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 right-3.5 bottom-4 sm:right-6 sm:bottom-6 pointer-events-auto select-none font-sans"
    >
      {isOpen ? (
        /* WINDOW CHAT */
        <div className="w-[320px] sm:w-[360px] h-[460px] sm:h-[500px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-navy-800 text-white flex items-center justify-between border-b border-navy-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full border border-orange-400 overflow-hidden shrink-0 bg-navy-900">
                <Image
                  src="/images/mascot-1.webp"
                  alt="Herdi"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover scale-[2.1] origin-top translate-y-1"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <h4 className="font-extrabold text-xs text-white">Herdi</h4>
                  <span className="px-1.5 py-0.2 rounded-[6px] bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Customer Service Employr</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-[8px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer border-0"
              title="Tutup Chat"
              aria-label="Tutup jendela bantuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-950/60 text-xs">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] p-2.5 rounded-[10px] space-y-1.5 shadow-xs ${
                      isBot
                        ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none"
                        : "bg-cobalt-600 text-white rounded-tr-none font-medium"
                    }`}
                  >
                    <p
                      className="whitespace-pre-wrap leading-relaxed text-xs"
                      dangerouslySetInnerHTML={{ __html: renderMessageHtml(msg.text) }}
                    />

                    {isBot && msg.slug && (
                      <Link
                        href={`/artikel/${msg.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cobalt-600 dark:text-blue-300 hover:underline pt-1"
                      >
                        <span>Buka panduan lengkap</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}

                    <span
                      className={`block text-[9px] ${
                        isBot ? "text-slate-400 dark:text-slate-500" : "text-blue-200"
                      } text-right`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center justify-start">
                <div className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Herdi mencari panduan...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {chips.length > 0 && (
            <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {chips.map((chip, idx) => (
                <button
                  key={`${chip}-${idx}`}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={isTyping}
                  className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 shrink-0 transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder="Tuliskan pertanyaanmu di sini..."
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[8px] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-8 h-8 rounded-[8px] bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 border-0"
              title="Kirim Pesan"
              aria-label="Kirim pertanyaan"
            >
              {isTyping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      ) : (
        /* FLOATING ACTION BUTTON (FAB) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-navy-800 hover:bg-navy-900 border-2 border-orange-400 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer p-0.5 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-orange-400/20"
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
          {/* Online Indicator */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
        </button>
      )}
    </div>
  );
}
