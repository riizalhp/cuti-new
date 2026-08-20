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

const toastVariants: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
  success: {
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40 backdrop-blur-xl",
    border: "border-emerald-500/30 dark:border-emerald-500/40",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    text: "text-emerald-900 dark:text-emerald-100",
  },
  error: {
    bg: "bg-rose-500/10 dark:bg-rose-950/40 backdrop-blur-xl",
    border: "border-rose-500/30 dark:border-rose-500/40",
    icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    text: "text-rose-900 dark:text-rose-100",
  },
  warning: {
    bg: "bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-xl",
    border: "border-amber-500/30 dark:border-amber-500/40",
    icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    text: "text-amber-900 dark:text-amber-100",
  },
  info: {
    bg: "bg-cobalt-500/10 dark:bg-cobalt-950/40 backdrop-blur-xl",
    border: "border-cobalt-500/30 dark:border-cobalt-500/40",
    icon: <Info className="h-5 w-5 text-cobalt-500 shrink-0" />,
    text: "text-cobalt-900 dark:text-cobalt-100",
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
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="sync">
          {toasts.map((t) => {
            const style = toastVariants[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 p-4 rounded-[14px] border shadow-lg shadow-black/5 dark:shadow-black/20 transition-all",
                  style.bg,
                  style.border,
                  style.text
                )}
              >
                <div className="mt-0.5">{style.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold leading-tight">{t.title}</h4>
                  {t.description && (
                    <p className="text-[11px] font-medium opacity-80 mt-1 leading-snug">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
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
