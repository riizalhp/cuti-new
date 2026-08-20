"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ConfirmType = "danger" | "warning" | "info" | "success";

interface ConfirmOptions {
  type?: ConfirmType;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  type?: ConfirmType;
  title: string;
  description?: string;
  buttonText?: string;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

const typeConfig: Record<ConfirmType, { icon: React.ReactNode; accent: string; bg: string; border: string }> = {
  danger: {
    icon: <AlertCircle className="h-6 w-6 text-rose-500" />,
    accent: "danger",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/50",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    accent: "warning",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  info: {
    icon: <Info className="h-6 w-6 text-cobalt-500 dark:text-cobalt-400" />,
    accent: "info",
    bg: "bg-cobalt-50 dark:bg-cobalt-950/30",
    border: "border-cobalt-200 dark:border-cobalt-800/50",
  },
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
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
  description?: string;
  confirmText: string;
  cancelText: string;
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              onClick={() => handleClose(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/10 dark:shadow-black/30 w-full max-w-sm overflow-hidden">
                {/* Icon header */}
                <div className={cn("flex items-center justify-center pt-6 pb-2")}>
                  <div className={cn("p-3 rounded-2xl border", config.bg, config.border)}>
                    {config.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-2 pt-3 text-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 leading-snug">
                    {state.title}
                  </h3>
                  {state.description && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {state.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 pt-4 flex gap-3">
                  {state.mode === "confirm" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-[12px]"
                      onClick={() => handleClose(false)}
                    >
                      {state.cancelText}
                    </Button>
                  )}
                  <Button
                    variant={state.type === "danger" ? "danger" : "primary"}
                    size="sm"
                    className="flex-1 rounded-[12px]"
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
