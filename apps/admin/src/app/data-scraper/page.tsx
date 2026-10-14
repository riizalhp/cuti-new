"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarToggle } from "@/components/admin/SidebarToggle";
import {
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
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
  Globe,
  Database,
  Key,
  Plus,
  Trash2,
  Activity,
  TrendingUp,
  BarChart3,
  Server,
  Zap,
  X,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { getQuotaResetCountdown } from "@/components/admin/ManualScrapeModal";

interface ScraperAccount {
  id: string;
  label: string;
  maskedKey: string;
  priority: number;
  isActive: boolean;
  status: string;
  requestsMonth: number;
  requestsTotal: number;
  successCount: number;
  failCount: number;
  successRate: number;
  remainingQuota: number;
  isQuotaExhausted: boolean;
  lastUsedAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface ScraperLogItem {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_label: string;
  user_name: string | null;
  target_url: string;
  target_name?: string | null;
  status: string;
  http_status: number | null;
  latency_ms: number | null;
  error_message: string | null;
  created_at: string;
}

interface StatsData {
  jobs: {
    scrapedActive: number;
    manualActive: number;
    inactive: number;
    total: number;
  };
  content: {
    articles: number;
    certifications: number;
    total: number;
  };
  zapi: {
    totalAccounts: number;
    activeAccounts: number;
    exhaustedAccounts: number;
    totalRequestsMonth: number;
    overallSuccessRate: number;
    resetCountdown: {
      days: number;
      hours: number;
      formattedDate: string;
      utcIso: string;
    };
  };
}

export default function DataScraperPage() {
  const [activeTab, setActiveTab] = useState<"workbench" | "accounts" | "logs">("workbench");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [accounts, setAccounts] = useState<ScraperAccount[]>([]);
  const [logs, setLogs] = useState<ScraperLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State (Workbench)
  const [engine, setEngine] = useState<"zapi" | "local">("zapi");
  const [entityType, setEntityType] = useState<"jobs" | "articles">("jobs");
  const [source, setSource] = useState<string>("kitalulus");
  const [query, setQuery] = useState<string>("fresh graduate");
  const [location, setLocation] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);

  // Scrape Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    created: number;
    updated: number;
    total: number;
    message: string;
    fallbackUsed?: boolean;
    remainingQuota?: string;
  } | null>(null);

  // Add Account State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountLabel, setNewAccountLabel] = useState("");
  const [newAccountKey, setNewAccountKey] = useState("");
  const [newAccountPriority, setNewAccountPriority] = useState(1);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Account Test State
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/scraper/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setAccounts(json.accounts || []);
        setLogs(json.logs || []);
      }
    } catch {
      showToast("error", "Gagal memuat data statistik scraper.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Add Zapi Account
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountLabel.trim() || !newAccountKey.trim()) {
      showToast("error", "Label akun dan API Key wajib diisi.");
      return;
    }
    setIsSavingAccount(true);
    try {
      const res = await fetch("/api/scraper-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "zapi",
          label: newAccountLabel.trim(),
          api_key: newAccountKey.trim(),
          priority: newAccountPriority,
          is_active: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Akun Zapi "${newAccountLabel}" berhasil ditambahkan.`);
        setNewAccountLabel("");
        setNewAccountKey("");
        setIsAddAccountOpen(false);
        loadAllData();
      } else {
        showToast("error", json.error || "Gagal menambahkan akun.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Test Zapi Account
  const handleTestAccount = async (id: string, label: string) => {
    setTestingAccountId(id);
    try {
      const res = await fetch(`/api/scraper-providers/${id}/test`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Koneksi ${label} Berhasil! (${json.data?.latencyMs || 0}ms). Sisa kuota bulan ini: ${json.data?.remainingQuota || "-"}`);
        loadAllData();
      } else {
        showToast("error", json.error || `Koneksi ${label} gagal.`);
      }
    } catch {
      showToast("error", `Gagal menguji koneksi ${label}.`);
    } finally {
      setTestingAccountId(null);
    }
  };

  // Delete Account
  const handleDeleteAccount = async (id: string, label: string) => {
    if (!window.confirm(`Hapus akun Zapi "${label}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/scraper-providers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Akun "${label}" dihapus.`);
        loadAllData();
      } else {
        showToast("error", json.error || "Gagal menghapus akun.");
      }
    } catch {
      showToast("error", "Gagal menghapus akun.");
    }
  };

  // Toggle Account Active
  const handleToggleAccount = async (account: ScraperAccount) => {
    try {
      const res = await fetch(`/api/scraper-providers/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !account.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Status akun ${account.label} diperbarui.`);
        loadAllData();
      } else {
        showToast("error", json.error || "Gagal memperbarui status.");
      }
    } catch {
      showToast("error", "Gagal memperbarui status akun.");
    }
  };

  // Execute Scrape (Workbench)
  const handleExecuteScrape = async () => {
    setIsProcessing(true);
    setProgress(5);
    setProgressText("Menyiapkan konfigurasi parameter...");
    setSyncLogs([]);
    setLastResult(null);

    const appendLog = (msg: string) => {
      setSyncLogs((prev) => [...prev, `[${new Date().toLocaleTimeString("id-ID")}] ${msg}`]);
    };

    try {
      if (engine === "zapi") {
        appendLog(`Memulai penarikan via Zapi Multi-Account Gateway...`);
        setProgress(20);
        setProgressText(`Mengecek urutan prioritas akun Zapi aktif...`);

        await new Promise((r) => setTimeout(r, 400));
        setProgress(40);
        setProgressText(`Menghubungi endpoint Zapi (${source.toUpperCase()})...`);
        appendLog(`Mengirim request penarikan: ${entityType.toUpperCase()} | Sumber: ${source} | Query: "${query || "-"}" | Lokasi: "${location || "Nasional"}"`);

        const res = await fetch("/api/scraper/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            source,
            query: query.trim(),
            location: location.trim(),
            limit,
          }),
        });

        setProgress(75);
        setProgressText("Memproses respon dan menyimpan ke PostgreSQL...");

        const json = await res.json();

        if (json.logs && Array.isArray(json.logs)) {
          json.logs.forEach((l: string) => appendLog(l));
        }

        if (json.success) {
          setProgress(100);
          setProgressText("Penarikan dan sinkronisasi data selesai!");
          setLastResult({
            success: true,
            created: json.created || 0,
            updated: json.updated || 0,
            total: json.totalProcessed || (json.created || 0) + (json.updated || 0),
            message: `Berhasil mengekstrak ${json.totalProcessed || 0} entri via ${json.accountUsed || "Zapi"}!`,
            fallbackUsed: json.fallbackUsed,
            remainingQuota: json.remainingQuotaMonth,
          });
          showToast("success", `✨ Scraping berhasil! ${json.created || 0} data baru ditambahkan.`);
          loadAllData();
        } else {
          setProgress(100);
          setProgressText("Proses scraping mengalami kendala.");
          setLastResult({
            success: false,
            created: 0,
            updated: 0,
            total: 0,
            message: json.error || "Gagal melakukan scraping data.",
          });
          appendLog(`ERROR: ${json.error || "Gagal melakukan penarikan data."}`);
          showToast("error", json.error || "Scraping gagal dijalankan.");
        }
      } else {
        // Engine: Local Web Scraper
        appendLog(`Menjalankan Mesin Scraper Web Lokal (Eks Scrape Malam)...`);
        setProgress(25);
        setProgressText(`Menginisialisasi modul parsing SSR portal publik...`);

        await new Promise((r) => setTimeout(r, 400));
        setProgress(50);
        setProgressText(`Mengekstrak feed lowongan/artikel secara langsung...`);

        const res = await fetch("/api/scraper/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            keyword: query.trim(),
            location: location.trim(),
          }),
        });

        setProgress(80);
        setProgressText("Menyimpan ke basis data & memperbarui relasi...");

        const json = await res.json();

        if (json.logs && Array.isArray(json.logs)) {
          json.logs.forEach((l: string) => appendLog(l));
        }

        if (json.success) {
          setProgress(100);
          setProgressText("Scraper lokal selesai!");
          setLastResult({
            success: true,
            created: json.created || 0,
            updated: json.updated || 0,
            total: (json.created || 0) + (json.updated || 0) + (json.deactivated || 0),
            message: `Scraper lokal selesai: ${json.created || 0} baru, ${json.updated || 0} diperbarui.`,
          });
          showToast("success", `Scraper lokal berhasil dijalankan.`);
          loadAllData();
        } else {
          setProgress(100);
          setProgressText("Scraper lokal gagal.");
          setLastResult({
            success: false,
            created: 0,
            updated: 0,
            total: 0,
            message: json.error || "Scraper lokal mengalami kendala.",
          });
          appendLog(`ERROR: ${json.error || "Scraper lokal gagal dijalankan."}`);
          showToast("error", json.error || "Scraper lokal gagal.");
        }
      }
    } catch (err: any) {
      setProgress(100);
      setProgressText("Terjadi error sistem.");
      appendLog(`EXCEPTION: ${err.message || "Koneksi terputus."}`);
      showToast("error", "Terjadi kesalahan saat memproses scraping.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetInfo = stats?.zapi?.resetCountdown || getQuotaResetCountdown();

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-200 p-4 md:p-8 space-y-6">
      {/* HEADER & CONTEXT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider bg-orange-950 text-orange-400 border border-orange-800/80 flex items-center gap-1">
                <DownloadCloud className="w-3 h-3 inline" />
                Data Scraper Hub
              </span>
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Mode Manual Admin
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Otomasi Malam Dinonaktifkan</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Pusat Sinkronisasi Data Loker & Artikel Karir</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
              Penarikan data manual terpusat dengan Zapi Multi-Account Gateway (auto-fallback kuota 600 req/bulan) dan Mesin Web Scraper Lokal. Data otomatis di-upsert ke portal lowongan dan artikel publik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadAllData}
            disabled={isLoading}
            className="px-3 py-2 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workbench")}
            className="px-4 py-2 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Mulai Tarik Data</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lowongan Ter-Scrape */}
        <div className="p-4 rounded-[12px] bg-[#0F1424] border border-slate-800/80 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lowongan Ter-Scrape (Aktif)</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {stats?.jobs.scrapedActive ?? "…"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Dari {stats?.jobs.total ?? "…"} total loker terdaftar
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Artikel & Konten */}
        <div className="p-4 rounded-[12px] bg-[#0F1424] border border-slate-800/80 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Artikel & Tips Karir</p>
            <h3 className="text-2xl font-black text-blue-400 mt-1">
              {stats?.content.total ?? "…"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {stats?.content.articles ?? 0} Artikel • {stats?.content.certifications ?? 0} Sertifikasi
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Akun Zapi & Quota */}
        <div className="p-4 rounded-[12px] bg-[#0F1424] border border-slate-800/80 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pool Akun Zapi</p>
            <h3 className="text-2xl font-black text-white mt-1">
              {stats?.zapi.activeAccounts ?? 0}{" "}
              <span className="text-xs font-semibold text-slate-400">/ {stats?.zapi.totalAccounts ?? 0} Aktif</span>
            </h3>
            <p className="text-[10px] text-orange-400 mt-0.5">
              {stats?.zapi.exhaustedAccounts ? `⚠️ ${stats.zapi.exhaustedAccounts} akun kuota habis` : "Semua akun dalam kondisi siap"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-orange-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Quota Reset Countdown */}
        <div className="p-4 rounded-[12px] bg-[#0F1424] border border-slate-800/80 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reset Kuota Bulanan</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <span>{resetInfo.days}h {resetInfo.hours}j</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Reset otomatis: 1 {new Date(Date.now() + 86400000 * 30).toLocaleString("id-ID", { month: "short" })} 07:00 WIB
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("workbench")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "workbench"
              ? "border-orange-500 text-orange-400 bg-orange-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Workbench Penarikan Data (Manual)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "accounts"
              ? "border-orange-500 text-orange-400 bg-orange-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Manajemen Akun Zapi & Fallback ({accounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === "logs"
              ? "border-orange-500 text-orange-400 bg-orange-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Riwayat & Audit Log ({logs.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: WORKBENCH */}
      {activeTab === "workbench" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Panel (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[#0F1424] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Konfigurasi Penarikan Data</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pilih mesin penarikan data, target entitas, kata kunci profesi, dan portal sumber yang ingin disinkronkan.
              </p>
            </div>

            {/* Mesin Scraper Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Mesin Scraping
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEngine("zapi")}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    engine === "zapi"
                      ? "bg-orange-950/40 border-orange-500 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${engine === "zapi" ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Zapi Multi-Account Gateway</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Pencarian terstruktur Google Jobs & Google News dengan auto-fallback antar akun Zapi jika 429.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine("local")}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    engine === "local"
                      ? "bg-blue-950/40 border-blue-500 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${engine === "local" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Mesin Web Scraper Lokal</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Mesin crawler publik SSR (Jobstreet, Glints, Kalibrr, Detik, Kompas, BNSP) yang dulunya berjalan otomatis di malam hari.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Target Data Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Target Data yang Ingin Di-Scrape
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEntityType("jobs");
                    setQuery("fresh graduate");
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    entityType === "jobs"
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold block">Lowongan Kerja (Jobs)</span>
                    <span className="text-[10px] text-slate-400">Sinkron ke database loker marketplace</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEntityType("articles");
                    setQuery("tips karir");
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    entityType === "articles"
                      ? "bg-slate-800 border-slate-600 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-xs font-bold block">Artikel & Tips Karir</span>
                    <span className="text-[10px] text-slate-400">Sinkron ke artikel edukasi & sertifikasi</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Portal / Source Selector */}
            {engine === "zapi" && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Pilih Portal Sumber Data
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {entityType === "jobs" ? (
                    <>
                      {[
                        { id: "kitalulus", label: "KitaLulus" },
                        { id: "pintarnya", label: "Pintarnya" },
                        { id: "jobstreet", label: "Jobstreet" },
                        { id: "alfamart", label: "Alfamart Karir" },
                        { id: "glints", label: "Glints" },
                        { id: "kalibrr", label: "Kalibrr" },
                        { id: "linkedin", label: "LinkedIn Jobs" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSource(p.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-left cursor-pointer flex items-center justify-between ${
                            source === p.id
                              ? "bg-orange-500/20 border-orange-500 text-orange-200"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span>{p.label}</span>
                          {source === p.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: "kompas", label: "Kompas Edukasi" },
                        { id: "detik", label: "Detik Edu" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSource(p.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition text-left cursor-pointer flex items-center justify-between ${
                            source === p.id
                              ? "bg-blue-500/20 border-blue-500 text-blue-200"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span>{p.label}</span>
                          {source === p.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Keyword Input & Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Kata Kunci Pencarian (Keyword)
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={entityType === "jobs" ? "Contoh: Admin, Kasir, Fresh Graduate" : "Contoh: Tips Interview, CV ATS"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Preset Cepat:</span>
                {(entityType === "jobs"
                  ? ["Fresh Graduate", "Admin", "Kasir", "Barista", "Customer Service", "Operator Produksi", "Gudang"]
                  : ["Tips Karir", "Tips Interview", "Cara Buat CV", "Nego Gaji", "Persiapan Magang"]
                ).map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setQuery(kw)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Limit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Kota / Wilayah (Opsional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jakarta, Surabaya, Bandung"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Batas Entri (Limit)
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value={10}>10 Entri per Request</option>
                  <option value={20}>20 Entri per Request</option>
                  <option value={30}>30 Entri per Request</option>
                </select>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecuteScrape}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Menjalankan Scraping...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-5 h-5" />
                    <span>Jalankan Scraping Sekarang (Manual)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress & Live Console (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Progress Card */}
            <div className="bg-[#0F1424] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Status Eksekusi Real-Time
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isProcessing
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : lastResult?.success
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isProcessing ? "Berjalan" : lastResult?.success ? "Selesai" : "Siap"}
                </span>
              </div>

              {/* Download Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">{progressText || "Menunggu perintah scraping..."}</span>
                  <span className="text-white font-black">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Result Summary (if finished) */}
              {lastResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    lastResult.success
                      ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                      : "bg-rose-950/40 border-rose-800/80 text-rose-200"
                  }`}
                >
                  <p className="font-extrabold text-white">{lastResult.message}</p>
                  {lastResult.success && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-800/40 text-[11px]">
                      <div>
                        <span className="text-slate-400">Data Baru:</span>{" "}
                        <strong className="text-emerald-300 font-black">{lastResult.created}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Data Diperbarui:</span>{" "}
                        <strong className="text-blue-300 font-black">{lastResult.updated}</strong>
                      </div>
                      {lastResult.remainingQuota && (
                        <div className="col-span-2 text-slate-400 text-[10px]">
                          Sisa kuota akun bulan ini: <span className="text-white font-bold">{lastResult.remainingQuota} req</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Terminal Logs */}
            <div className="bg-[#090D1A] border border-slate-800 rounded-2xl p-4 font-mono text-[11px] space-y-2 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-slate-400">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-orange-400" />
                  Terminal Log Penarikan
                </span>
                <span className="text-[10px] text-slate-500">{syncLogs.length} baris log</span>
              </div>
              <div className="h-64 overflow-y-auto space-y-1 text-slate-300 pr-1">
                {syncLogs.length === 0 ? (
                  <p className="text-slate-600 italic">Log operasi penarikan data akan tampil di sini secara real-time...</p>
                ) : (
                  syncLogs.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.includes("ERROR") || line.includes("Gagal")
                          ? "text-rose-400"
                          : line.includes("fallback") || line.includes("429")
                          ? "text-amber-400 font-bold"
                          : line.includes("Selesai") || line.includes("Berhasil")
                          ? "text-emerald-400 font-bold"
                          : "text-slate-300"
                      }
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MANAJEMEN AKUN ZAPI */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Cascading Fallback Notice Banner */}
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Server className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-orange-300">
                  Prinsip Cascading Fallback Akun Zapi (Batas 600 Request/Bulan):
                </p>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  Tiap akun Zapi gratis mendapatkan kuota <strong className="text-white">600 request / bulan</strong> (reset tiap tanggal 1). Jika akun Prioritas 1 kehabisan kuota (HTTP 429), sistem akan <strong className="text-orange-400">otomatis beralih ke Prioritas 2</strong> tanpa intervensi manual. Daftarkan beberapa akun Zapi untuk memperluas kuota gratis hingga ribuan request.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddAccountOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Zapi</span>
            </button>
          </div>

          {/* Add Account Drawer (Slide-in Right) */}
          <AnimatePresence>
            {isAddAccountOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity">
                {/* Backdrop click listener */}
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setIsAddAccountOpen(false)}
                />

                {/* Drawer Panel */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-[#0F141F] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-[10px] bg-orange-950 border border-orange-800 flex items-center justify-center text-orange-400 shrink-0">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">
                          Tambah Akun Zapi Baru
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Integrasi API key dan konfigurasi failover cascading
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddAccountOpen(false)}
                      className="w-8 h-8 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Body */}
                  <form onSubmit={handleAddAccount} className="flex-1 flex flex-col justify-between min-h-0">
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Label Akun <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newAccountLabel}
                          onChange={(e) => setNewAccountLabel(e.target.value)}
                          placeholder="Contoh: Zapi Akun 1 (Email Utama)"
                          className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          API Key Zapi (x-api-key) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newAccountKey}
                          onChange={(e) => setNewAccountKey(e.target.value)}
                          placeholder="zpi_live_xxxxxxxxxxxxxxxx"
                          className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                        />
                        <p className="text-[10px] text-slate-500">
                          Ambil dari menu Keys di dashboard zapi.ink. API key akan dienkripsi dengan aman di basis data.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Prioritas Eksekusi
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newAccountPriority}
                          onChange={(e) => setNewAccountPriority(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-[10px] bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                        <p className="text-[10px] text-slate-500">
                          Angka lebih kecil dipanggil lebih awal (1 = Akun Utama, 2 = Cadangan Fallback 1).
                        </p>
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddAccountOpen(false)}
                        className="px-4 py-2.5 rounded-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAccount}
                        className="px-4 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition"
                      >
                        {isSavingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Simpan Akun</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Accounts Table */}
          <div className="bg-[#0F1424] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Daftar Akun Zapi Terdaftar</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Diurutkan berdasarkan prioritas fallback cascading.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-bold">{accounts.length} Akun</span>
            </div>

            {accounts.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Server className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Belum ada akun Zapi yang didaftarkan ke sistem.</p>
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Akun Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Prioritas</th>
                      <th className="p-3.5">Label & Kredensial</th>
                      <th className="p-3.5">Kuota Bulan Ini</th>
                      <th className="p-3.5">Success Rate</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <span className="px-2 py-1 rounded-[6px] text-[10px] font-black bg-slate-800 text-orange-400 border border-slate-700">
                            Prioritas #{acc.priority}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white text-xs">{acc.label}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">{acc.maskedKey}</div>
                        </td>
                        <td className="p-3.5 min-w-[180px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-white">{acc.requestsMonth} / 600 req</span>
                            <span className={`text-[10px] font-bold ${acc.remainingQuota < 50 ? "text-rose-400" : "text-emerald-400"}`}>
                              Sisa {acc.remainingQuota}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                acc.requestsMonth >= 600
                                  ? "bg-rose-500"
                                  : acc.requestsMonth > 450
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${Math.min(100, (acc.requestsMonth / 600) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-white text-xs">{acc.successRate}%</div>
                          <div className="text-[10px] text-slate-500">
                            {acc.successCount} sukses • {acc.failCount} gagal
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              !acc.isActive
                                ? "bg-slate-800 text-slate-400"
                                : acc.isQuotaExhausted
                                ? "bg-rose-950 text-rose-400 border border-rose-800"
                                : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            }`}
                          >
                            {!acc.isActive ? "Nonaktif" : acc.isQuotaExhausted ? "Kuota Habis" : "Aktif"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTestAccount(acc.id, acc.label)}
                              disabled={testingAccountId === acc.id}
                              className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-300 text-[11px] font-bold border border-blue-800/80 transition cursor-pointer disabled:opacity-50"
                            >
                              {testingAccountId === acc.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Uji Koneksi"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAccount(acc)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer"
                            >
                              {acc.isActive ? "Matikan" : "Aktifkan"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id, acc.label)}
                              className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LOGS & AUDIT */}
      {activeTab === "logs" && (
        <div className="bg-[#0F1424] border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-white">Audit Log Aktivitas Scraping</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Riwayat eksekusi penarikan data publik, status HTTP, dan latensi.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAllData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Segarkan Log</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              Belum ada riwayat log scraping tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Engine / Akun</th>
                    <th className="p-3">Target Entitas</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latensi</th>
                    <th className="p-3">Pesan / Respon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="p-3 whitespace-nowrap text-slate-400">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="p-3 font-sans font-bold text-white">
                        {log.provider_label || log.provider_name}
                      </td>
                      <td className="p-3 font-sans text-slate-300 max-w-[200px] truncate">
                        {log.target_name || log.target_url}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : log.status === "EXHAUSTED"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          }`}
                        >
                          {log.status} {log.http_status ? `(${log.http_status})` : ""}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{log.latency_ms ? `${log.latency_ms}ms` : "-"}</td>
                      <td className="p-3 font-sans text-slate-400 max-w-[280px] truncate">
                        {log.error_message || "Sukses diekstrak"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full px-4 sm:px-0 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-2xl backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-950/95 border-emerald-700/80 text-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-950/95 border-rose-700/80 text-rose-100"
                  : "bg-blue-950/95 border-blue-700/80 text-blue-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    toast.type === "success"
                      ? "bg-emerald-800 text-emerald-200"
                      : toast.type === "error"
                      ? "bg-rose-800 text-rose-200"
                      : "bg-blue-800 text-blue-200"
                  }`}
                >
                  {toast.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : toast.type === "error" ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </div>
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
