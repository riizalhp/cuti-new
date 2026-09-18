"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ConfirmType = "danger" | "warning" | "info" | "success";

interface ConfirmOptions {
  type?: ConfirmType;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "warning";
}

interface AlertOptions {
  type?: ConfirmType;
  title: string;
  description?: React.ReactNode;
  buttonText?: string;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

const typeConfig: Record<ConfirmType, { icon: React.ReactNode; accent: string; bg: string; border: string }> = {
  danger: {
    icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
    accent: "danger",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/50",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    accent: "warning",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  info: {
    icon: <Info className="h-5 w-5 text-cobalt-500 dark:text-cobalt-400" />,
    accent: "info",
    bg: "bg-cobalt-50 dark:bg-cobalt-950/30",
    border: "border-cobalt-200 dark:border-cobalt-800/50",
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    accent: "success",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
};

interface DialogState {
  open: boolean;
  mode: "confirm" | "alert";
  type: ConfirmType;
  title: string;
  description?: React.ReactNode;
  confirmText: string;
  cancelText: string;
  confirmVariant?: "primary" | "danger" | "warning";
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({
    open: false,
    mode: "confirm",
    type: "info",
    title: "",
    description: undefined,
    confirmText: "Ya, lanjutkan",
    cancelText: "Batal",
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        mode: "confirm",
        type: options.type ?? "warning",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Ya, lanjutkan",
        cancelText: options.cancelText ?? "Batal",
        confirmVariant: options.confirmVariant,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      resolveRef.current = () => resolve();
      setState({
        open: true,
        mode: "alert",
        type: options.type ?? "info",
        title: options.title,
        description: options.description,
        confirmText: options.buttonText ?? "OK",
        cancelText: "",
      });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      resolveRef.current?.(result);
      resolveRef.current = null;
    }, 200);
  }, []);

  // Keyboard accessibility: ESC key to close
  useEffect(() => {
    if (!state.open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.open, handleClose]);

  const config = typeConfig[state.type];

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}

      <AnimatePresence>
        {state.open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[9998]"
              onClick={() => handleClose(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-950/20 w-full max-w-md overflow-hidden relative pointer-events-auto"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="absolute top-3.5 right-3.5 p-1 rounded-[8px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Tutup dialog"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon header */}
                <div className={cn("flex items-center justify-center pt-6 pb-1")}>
                  <div className={cn("p-2.5 rounded-[10px] border shadow-xs", config.bg, config.border)}>
                    {config.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-2 pt-2 text-center">
                  <h3
                    id="confirm-dialog-title"
                    className="text-base font-extrabold text-slate-900 dark:text-slate-50 leading-snug tracking-tight"
                  >
                    {state.title}
                  </h3>
                  {state.description && (
                    <div className="mt-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {typeof state.description === "string" ? (
                        <p className="whitespace-pre-line leading-relaxed text-slate-500 dark:text-slate-400 text-center">
                          {state.description}
                        </p>
                      ) : (
                        state.description
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 pt-4 flex gap-2.5">
                  {state.mode === "confirm" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-[10px] text-xs font-bold py-2.5 h-auto cursor-pointer"
                      onClick={() => handleClose(false)}
                    >
                      {state.cancelText}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={
                      state.confirmVariant === "danger" || (!state.confirmVariant && state.type === "danger")
                        ? "danger"
                        : "primary"
                    }
                    size="sm"
                    className={cn(
                      "flex-1 rounded-[10px] text-xs font-bold py-2.5 h-auto cursor-pointer",
                      state.confirmVariant === "warning" &&
                        "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                    )}
                    onClick={() => handleClose(true)}
                  >
                    {state.confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context;
}
