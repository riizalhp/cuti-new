"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Briefcase,
  FileText,
  Building2,
  MapPin,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
} from "lucide-react";

interface ManualScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function getQuotaResetCountdown() {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  const diffMs = Math.max(0, nextMonth.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const resetDateStr =
    nextMonth.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }) + ", 07:00 WIB";

  return { days, hours, resetDateStr };
}

export function ManualScrapeModal({ isOpen, onClose, onSuccess }: ManualScrapeModalProps) {
  const [entityType, setEntityType] = useState<"jobs" | "articles">("jobs");
  const [source, setSource] = useState<string>("kitalulus");
  const [query, setQuery] = useState<string>("fresh graduate");
  const [location, setLocation] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);

  // Download / Sync State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetInfo = getQuotaResetCountdown();

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setProgress(0);
      setProgressText("");
      setSyncLogs([]);
      setSyncResult(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleStartScrape = async () => {
    setIsProcessing(true);
    setProgress(15);
    setProgressText("Menghubungkan ke Zapi API Gateway...");
    setSyncLogs(["[0s] Memulai request penarikan manual...", "[0.2s] Memeriksa pool API key Zapi aktif..."]);
    setErrorMessage(null);
    setSyncResult(null);

    const stepInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) return prev + 10;
        if (prev < 75) return prev + 5;
        return prev;
      });
    }, 400);

    try {
      setTimeout(() => {
        setProgressText(`Mengunduh ${entityType === "jobs" ? "lowongan" : "artikel"} dari ${source.toUpperCase()}...`);
        setSyncLogs((l) => [...l, `[0.6s] Mengirim query "${query}" ke upstream ${source}...`]);
      }, 700);

      const res = await fetch("/api/scraper/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          source,
          query,
          location,
          limit,
        }),
      });

      clearInterval(stepInterval);
      const json = await res.json();

      if (json.success) {
        setProgress(90);
        setProgressText("Menyimpan & normalisasi entitas ke PostgreSQL...");
        setSyncLogs((l) => [
          ...l,
          `[1.2s] Menerima ${json.data.totalItemsFound} item dari ${source}.`,
          `[1.5s] Akun yang digunakan: ${json.data.providerUsed}.`,
          `[1.8s] Menyimpan: ${json.data.newCount} baru, ${json.data.updatedCount} diperbarui.`,
        ]);

        if (json.data.fallbackOccurred) {
          setSyncLogs((l) => [...l, `[Peringatan] Terjadi fallback antar akun Zapi.`]);
        }

        setTimeout(() => {
          setProgress(100);
          setProgressText("Penarikan dan sinkronisasi data berhasil!");
          setSyncResult(json.data);
          setIsProcessing(false);
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setProgress(100);
        setErrorMessage(json.error || "Gagal menarik data dari Zapi.");
        setSyncLogs((l) => [...l, `[Error] ${json.error || "Gagal menarik data."}`]);
        setIsProcessing(false);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setProgress(100);
      setErrorMessage(err.message || "Terjadi kendala jaringan.");
      setSyncLogs((l) => [...l, `[Error] ${err.message}`]);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity">
          {/* Backdrop Click */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              if (!isProcessing) onClose();
            }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/20">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    Tarik Data
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Auto-Fallback
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih sumber untuk disimpan ke database.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Kuota & Reset Bar */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Reset Zapi:</strong> {resetInfo.days} hari lagi
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold">
                600 Req/Akun
              </span>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm min-h-0">
              {!isProcessing && !syncResult && (
                <>
                  {/* 1. Pilih Tipe Entitas */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      1. Pilih Tipe Data
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEntityType("jobs");
                          setSource("kitalulus");
                          setQuery("fresh graduate");
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-[10px] border text-left transition ${
                          entityType === "jobs"
                            ? "border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/20 text-[#1738D1] dark:text-blue-400 font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Briefcase className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">Lowongan</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEntityType("articles");
                          setSource("kompas");
                          setQuery("tips karir");
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-[10px] border text-left transition ${
                          entityType === "articles"
                            ? "border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/20 text-[#1738D1] dark:text-blue-400 font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <FileText className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">Artikel</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Pilih Portal Sumber */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      2. Pilih Portal Sumber
                    </label>
                    {entityType === "jobs" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "kitalulus", name: "KitaLulus", badge: "SMA/SMK", hot: true },
                          { id: "pintarnya", name: "Pintarnya", badge: "Blue Collar", hot: true },
                          { id: "jobstreet", name: "Jobstreet ID", badge: "Umum" },
                          { id: "linkedin", name: "LinkedIn Jobs", badge: "Profesional" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSource(p.id)}
                            className={`p-3 rounded-[10px] border text-left transition flex flex-col justify-between ${
                              source === p.id
                                ? "border-[#1738D1] bg-blue-50/40 dark:bg-blue-950/30 text-slate-900 dark:text-white"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">{p.name}</span>
                              {p.hot && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Utama
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{p.badge}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: "kompas", name: "Kompas Edukasi & Tekno", desc: "Tips karir, regulasi kerja & edukasi" },
                          { id: "detik", name: "Detik Edukasi", desc: "Tips interview, CV, dan persiapan kerja" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSource(p.id)}
                            className={`p-3.5 rounded-[10px] border text-left transition ${
                              source === p.id
                                ? "border-[#1738D1] bg-blue-50/40 dark:bg-blue-950/30 font-bold text-slate-900 dark:text-white"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <div className="font-bold text-sm">{p.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Parameter Filter & Kata Kunci */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      3. Parameter Pencarian
                    </label>

                    {/* Preset Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-slate-400 mr-1 self-center">Preset:</span>
                      {(entityType === "jobs"
                        ? ["fresh graduate", "admin", "kasir", "operator produksi"]
                        : ["tips karir", "interview kerja", "cara membuat cv"]
                      ).map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => setQuery(kw)}
                          className={`text-[11px] px-2.5 py-1 rounded-[10px] border transition ${
                            query.toLowerCase() === kw.toLowerCase()
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold border-transparent"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Kata Kunci Pencarian:
                        </span>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Contoh: staff admin, teknisi, dll"
                          className="w-full px-3 py-2 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]/20 focus:border-[#1738D1] text-sm"
                        />
                      </div>

                      {entityType === "jobs" && (
                        <div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                            Lokasi / Kota (Opsional):
                          </span>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Contoh: Jakarta, Surabaya, Bandung"
                            className="w-full px-3 py-2 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]/20 focus:border-[#1738D1] text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                        Batas Tarikan Data:
                      </span>
                      <div className="flex gap-2">
                        {[10, 20, 50].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setLimit(num)}
                            className={`px-3 py-1.5 rounded-[10px] border text-xs font-bold transition ${
                              limit === num
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {num} Data
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Progress Bar & Live Status Saat Sedang Download */}
              {(isProcessing || syncResult || errorMessage) && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-[#1738D1]" />}
                      {syncResult ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5" /> Selesai
                        </span>
                      ) : errorMessage ? (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-5 h-5" /> Kendala Sinkronisasi
                        </span>
                      ) : (
                        progressText
                      )}
                    </span>
                    <span className="font-mono font-bold text-[#1738D1] text-base">{progress}%</span>
                  </div>

                  {/* Progress Bar Element */}
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        errorMessage
                          ? "bg-rose-500"
                          : progress === 100
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-[#1738D1] to-blue-500"
                      }`}
                    />
                  </div>

                  {/* Error Message Box */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Hasil Sukses Box */}
                  {syncResult && (
                    <div className="p-4 rounded-[10px] bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Total Ditemukan</div>
                          <div className="font-bold text-lg text-slate-900 dark:text-white">
                            {syncResult.totalItemsFound}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50">
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Data Baru</div>
                          <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            +{syncResult.newCount}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50">
                          <div className="text-xs text-blue-600 dark:text-blue-400">Diperbarui</div>
                          <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {syncResult.updatedCount}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-emerald-200/40 dark:border-emerald-800/40">
                        <span>
                          Akun: <strong>{syncResult.providerUsed}</strong>
                        </span>
                        <span>
                          Latency: <strong>{syncResult.latencyMs}ms</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Live Terminal Log Box */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Live Log Eksekusi:
                    </span>
                    <div className="bg-slate-950 text-slate-200 font-mono text-[11px] p-3 rounded-[10px] max-h-36 overflow-y-auto space-y-1 border border-slate-800">
                      {syncLogs.map((line, idx) => (
                        <div
                          key={idx}
                          className={
                            line.includes("Error")
                              ? "text-rose-400"
                              : line.includes("Peringatan")
                              ? "text-amber-400"
                              : line.includes("Menerima") || line.includes("Menyimpan")
                              ? "text-emerald-400"
                              : "text-slate-300"
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {syncResult ? "Tutup" : "Batal"}
              </button>

              {!syncResult ? (
                <button
                  type="button"
                  onClick={handleStartScrape}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-xs shadow-md shadow-[#1738D1]/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      Mulai Unduh
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSyncResult(null);
                    setProgress(0);
                    setSyncLogs([]);
                  }}
                  className="px-4 py-2.5 rounded-[10px] bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Tarik Data Lainnya
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
