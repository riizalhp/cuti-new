"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string; duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastVariants: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; iconBg: string }
> = {
  success: {
    bg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
    border: "border-emerald-200 dark:border-emerald-800/80 shadow-emerald-500/10",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60",
  },
  error: {
    bg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
    border: "border-rose-200 dark:border-rose-800/80 shadow-rose-500/10",
    icon: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    iconBg: "bg-rose-50 dark:bg-rose-950/80 border border-rose-200/60 dark:border-rose-800/60",
  },
  warning: {
    bg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
    border: "border-amber-200 dark:border-amber-800/80 shadow-amber-500/10",
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    iconBg: "bg-amber-50 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-800/60",
  },
  info: {
    bg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
    border: "border-cobalt-200 dark:border-cobalt-800/80 shadow-cobalt-500/10",
    icon: <Info className="h-4 w-4 text-cobalt-600 dark:text-cobalt-400 shrink-0" />,
    iconBg: "bg-cobalt-50 dark:bg-cobalt-950/80 border border-cobalt-200/60 dark:border-cobalt-800/60",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = "info", title, description, duration = 4000 }: { type?: ToastType; title: string; description?: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, description?: string) => toast({ type: "success", title, description }), [toast]);
  const error = useCallback((title: string, description?: string) => toast({ type: "error", title, description }), [toast]);
  const warning = useCallback((title: string, description?: string) => toast({ type: "warning", title, description }), [toast]);
  const info = useCallback((title: string, description?: string) => toast({ type: "info", title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Container - Centered on mobile, top-right on desktop */}
      <aside
        role="region"
        aria-live="polite"
        aria-label="Pemberitahuan Sistem"
        className="fixed top-4 sm:top-5 inset-x-0 sm:inset-x-auto sm:right-5 sm:left-auto z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] sm:w-full max-w-md mx-auto sm:mx-0 pointer-events-none items-center sm:items-stretch"
      >
        <AnimatePresence mode="sync">
          {toasts.map((t) => {
            const style = toastVariants[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 350) {
                    dismiss(t.id);
                  }
                }}
                whileDrag={{ scale: 0.98, cursor: "grabbing" }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "pointer-events-auto w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-[10px] border shadow-xl shadow-slate-900/10 dark:shadow-black/40 transition-colors cursor-grab active:cursor-grabbing touch-pan-y select-none",
                  style.bg,
                  style.border
                )}
              >
                <div className={cn("p-1.5 rounded-[8px] shrink-0 mt-0.5 flex items-center justify-center", style.iconBg)}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white">{t.title}</h4>
                  {t.description && (
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{t.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Tutup pemberitahuan"
                  className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 mt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
