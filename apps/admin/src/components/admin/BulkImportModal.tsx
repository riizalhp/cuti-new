"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  ChevronRight,
  Info,
} from "lucide-react"
import {
  CMSEntityKey,
  ENTITY_CONFIGS,
  downloadTemplate,
  parseImportFile,
} from "@/lib/cms-excel"

export interface BulkImportSuccessResult {
  insertedCount: number
  failedCount: number
  errors?: { row: number; title?: string; error: string }[]
}

interface BulkImportModalProps {
  isOpen: boolean
  entityKey: CMSEntityKey
  onClose: () => void
  onSuccess: (result?: BulkImportSuccessResult) => void
}

export function BulkImportModal({
  isOpen,
  entityKey,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedItems, setParsedItems] = useState<any[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    insertedCount: number
    failedCount: number
    errors: { row: number; title?: string; error: string }[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const config = ENTITY_CONFIGS[entityKey]

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile)
    setParseError(null)
    setResult(null)
    setIsParsing(true)

    try {
      const res = await parseImportFile(selectedFile, entityKey)
      if (!res.success) {
        setParseError(res.error || "Gagal memproses file.")
        setParsedItems([])
      } else {
        setParsedItems(res.items)
      }
    } catch (e: any) {
      setParseError(e.message || "Terjadi kesalahan saat membaca file.")
      setParsedItems([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  const handleSubmit = async () => {
    if (parsedItems.length === 0) return
    setIsSubmitting(true)
    setParseError(null)

    const CHUNK_SIZE = 500
    const totalItems = parsedItems.length
    let totalInserted = 0
    let totalFailed = 0
    const allErrors: { row: number; title?: string; error: string }[] = []

    try {
      for (let offset = 0; offset < totalItems; offset += CHUNK_SIZE) {
        const chunk = parsedItems.slice(offset, offset + CHUNK_SIZE)
        const currentEnd = Math.min(offset + CHUNK_SIZE, totalItems)
        setProgress({ current: currentEnd, total: totalItems })

        const res = await fetch("/api/cms/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: entityKey,
            items: chunk,
          }),
        })

        const json = await res.json()
        if (!json.success) {
          throw new Error(json.message || `Gagal mengimpor batch baris ${offset + 1} - ${currentEnd}`)
        }

        totalInserted += json.insertedCount || 0
        totalFailed += json.failedCount || 0
        if (json.errors && Array.isArray(json.errors)) {
          const adjustedErrors = json.errors.map((err: any) => ({
            ...err,
            row: err.row + offset,
          }))
          allErrors.push(...adjustedErrors)
        }
      }

      setResult({
        insertedCount: totalInserted,
        failedCount: totalFailed,
        errors: allErrors,
      })
      if (totalInserted > 0) {
        onSuccess({ insertedCount: totalInserted, failedCount: totalFailed, errors: allErrors })
      }
    } catch (e: any) {
      setParseError(e.message || "Terjadi kesalahan saat memproses import.")
    } finally {
      setIsSubmitting(false)
      setProgress(null)
    }
  }

  const resetForm = () => {
    setFile(null)
    setParsedItems([])
    setParseError(null)
    setResult(null)
    setProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] shadow-2xl p-6 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-orange-500">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                Bulk Insert {config.label}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Impor banyak data sekaligus menggunakan file XLSX, CSV, atau JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Format Download Box */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-[10px] p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info size={16} className="text-blue-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Butuh contoh format data?
              </span>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                Unduh template resmi siap isi:
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => downloadTemplate(entityKey, "xlsx")}
              className="px-2.5 py-1.5 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1 cursor-pointer"
              title="Unduh Format Excel (XLSX)"
            >
              <FileSpreadsheet size={13} />
              .XLSX
            </button>
            <button
              type="button"
              onClick={() => downloadTemplate(entityKey, "csv")}
              className="px-2.5 py-1.5 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer"
              title="Unduh Format CSV"
            >
              <FileText size={13} />
              .CSV
            </button>
            <button
              type="button"
              onClick={() => downloadTemplate(entityKey, "json")}
              className="px-2.5 py-1.5 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Unduh Format JSON"
            >
              .JSON
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        {!result && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[10px] p-6 text-center cursor-pointer transition-all ${
              file
                ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10"
                : "border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0])
                }
              }}
            />
            <div className="w-12 h-12 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <UploadCloud size={24} className="text-orange-500" />
            </div>
            {file ? (
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB — Klik untuk ganti berkas
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tarik file ke sini, atau klik untuk memilih
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung Microsoft Excel (.xlsx), CSV (.csv), atau JSON (.json)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner Parsing */}
        {isParsing && (
          <div className="py-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin text-orange-500" />
            Membaca dan memverifikasi data berkas...
          </div>
        )}

        {/* Live Progress Bar for Chunked Import */}
        {progress && (
          <div className="mt-4 p-4 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                Mengimpor data ke server ({progress.current.toLocaleString("id-ID")} dari {progress.total.toLocaleString("id-ID")} baris)...
              </span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {parseError && (
          <div className="mt-4 p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal memproses berkas:</span> {parseError}
            </div>
          </div>
        )}

        {/* Preview of Parsed Items */}
        {!result && parsedItems.length > 0 && (
          <div className="mt-5 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden">
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                {parsedItems.length} baris data terdeteksi
              </span>
              <span className="text-slate-400 font-medium">
                Pratinjau {Math.min(parsedItems.length, 3)} baris pertama
              </span>
            </div>
            <div className="overflow-x-auto max-h-48 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="px-3 py-2">#</th>
                    {config.columns.slice(0, 4).map((col) => (
                      <th key={col.key} className="px-3 py-2 font-bold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedItems.slice(0, 3).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                      {config.columns.slice(0, 4).map((col) => (
                        <td key={col.key} className="px-3 py-2 max-w-[140px] truncate">
                          {String(item[col.key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Notification */}
        {result && (
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 size={18} />
                Bulk Insert Selesai!
              </div>
              <p className="text-xs mt-1">
                Berhasil menambahkan <strong>{result.insertedCount}</strong> data baru ke database.
                {result.failedCount > 0 && ` Terdapat ${result.failedCount} data yang gagal.`}
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="p-3.5 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 max-h-36 overflow-y-auto">
                <p className="font-bold mb-1">Catatan Baris Gagal:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Baris {err.row} ({err.title}): {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {result ? (
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
            >
              Selesai &amp; Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={parsedItems.length === 0 || isSubmitting}
                className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-[0.98] transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    Impor {parsedItems.length > 0 ? `${parsedItems.length} Data` : ""}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
