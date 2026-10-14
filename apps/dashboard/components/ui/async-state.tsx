import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AsyncStateProps {
  isLoading?: boolean;
  error?: string | Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingSkeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AsyncState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingSkeleton,
  emptyState,
  children,
  className,
}: AsyncStateProps) {
  if (isLoading) {
    if (loadingSkeleton) {
      return (
        <div aria-busy="true" aria-live="polite" className={className}>
          {loadingSkeleton}
        </div>
      );
    }
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "flex flex-col items-center justify-center p-8 gap-3 min-h-[160px] text-slate-500 dark:text-slate-400",
          className
        )}
      >
        <div
          className="size-6 animate-spin rounded-full border-2 border-cobalt-500 border-t-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-caption font-medium">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    const message =
      typeof error === "string"
        ? error
        : error.message || "Terjadi kesalahan saat memuat data.";

    return (
      <div
        role="alert"
        className={cn(
          "p-4 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 text-rose-700 dark:text-rose-400 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">
            <p className="font-bold">{message}</p>
            <p className="text-caption text-rose-700 dark:text-rose-300 mt-0.5">
              Periksa sambungan internet kamu atau coba beberapa saat lagi.
            </p>
          </div>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0 bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50"
          >
            <RefreshCw className="size-3.5" />
            <span>Coba lagi</span>
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className}>
        {emptyState ?? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Belum ada data tersedia.
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
