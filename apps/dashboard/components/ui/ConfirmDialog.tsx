"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

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

const typeConfig: Record<ConfirmType, { icon: React.ReactNode; bg: string; border: string }> = {
  danger: {
    icon: <AlertCircle className="size-5 text-rose-700 dark:text-rose-400" />,
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/50",
  },
  warning: {
    icon: <AlertTriangle className="size-5 text-amber-700 dark:text-amber-400" />,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  info: {
    icon: <Info className="size-5 text-cobalt-500 dark:text-cobalt-400" />,
    bg: "bg-cobalt-50 dark:bg-cobalt-950/30",
    border: "border-cobalt-200 dark:border-cobalt-800/50",
  },
  success: {
    icon: <CheckCircle2 className="size-5 text-emerald-700 dark:text-emerald-400" />,
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
    }, 150);
  }, []);

  const config = typeConfig[state.type];

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}

      <AlertDialog
        open={state.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose(false);
        }}
      >
        <AlertDialogContent className="p-6 text-center max-w-md">
          {/* Icon header */}
          <div className="flex items-center justify-center pt-2 pb-1">
            <div
              className={cn(
                "p-2.5 rounded-[10px] border shadow-xs",
                config.bg,
                config.border
              )}
            >
              {config.icon}
            </div>
          </div>

          <AlertDialogHeader className="text-center sm:text-center space-y-2">
            <AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-slate-50 leading-snug">
              {state.title}
            </AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription asChild>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {typeof state.description === "string" ? (
                    <p className="whitespace-pre-line leading-relaxed text-slate-500 dark:text-slate-400">
                      {state.description}
                    </p>
                  ) : (
                    state.description
                  )}
                </div>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* Actions */}
          <div className="pt-3 flex gap-2.5">
            {state.mode === "confirm" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                autoFocus
                className="flex-1 rounded-[10px] border border-slate-200 dark:border-slate-800"
                onClick={() => handleClose(false)}
              >
                {state.cancelText}
              </Button>
            )}
            <Button
              type="button"
              variant={
                state.confirmVariant === "danger" ||
                (!state.confirmVariant && state.type === "danger")
                  ? "danger"
                  : "primary"
              }
              size="sm"
              className={cn(
                "flex-1 rounded-[10px]",
                state.confirmVariant === "warning" &&
                  "bg-amber-700 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
              )}
              onClick={() => handleClose(true)}
            >
              {state.confirmText}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
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
