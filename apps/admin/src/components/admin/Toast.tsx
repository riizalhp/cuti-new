"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastData {
  type: ToastType
  message: string
}

interface ToastProps {
  toast: ToastData | null
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`p-3.5 rounded-[10px] border text-xs font-bold flex items-center justify-between shadow-2xl backdrop-blur-md bg-slate-900/95 dark:bg-slate-900/95 ${
              toast.type === "success"
                ? "border-emerald-500/40 text-slate-100"
                : toast.type === "error"
                ? "border-rose-500/40 text-slate-100"
                : toast.type === "warning"
                ? "border-amber-500/40 text-slate-100"
                : "border-blue-500/40 text-slate-100"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : toast.type === "error"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : toast.type === "warning"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : toast.type === "error" ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : toast.type === "warning" ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <Info className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="leading-snug text-slate-100 font-semibold break-words">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
