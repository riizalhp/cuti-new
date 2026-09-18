'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckSquare,
  Square,
  ShieldAlert,
  Calendar,
  Banknote,
  Copy,
  Check,
  Building2,
  Briefcase,
  Info,
  Send,
} from 'lucide-react';
import { TrackerDatePicker } from '@/components/ui/TrackerDatePicker';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { ApplicationItem } from './TrackerView';

export interface OfferingChecklistItem {
  id: string;
  category: 'kompensasi' | 'keamanan' | 'administrasi';
  label: string;
  description: string;
  badgeText: string;
  alertLevel?: 'warning' | 'info' | 'critical';
}

export const DEFAULT_OFFERING_CHECKLIST: OfferingChecklistItem[] = [
  {
    id: 'salary_gross_nett',
    category: 'kompensasi',
    label: 'Cek Gaji: Gross vs. Nett & Komponennya',
    description: 'Pastikan angka yang tertera apakah Gross (sebelum dipotong PPh 21 & iuran BPJS) atau Nett (bersih masuk rekening). Periksa rincian gaji pokok vs tunjangan tetap & tunjangan kehadiran.',
    badgeText: 'Gaji & Tunjangan',
  },
  {
    id: 'contract_status_probation',
    category: 'kompensasi',
    label: 'Status Kerja (PKWT / Tetap) & Masa Percobaan',
    description: 'Ketahui apakah statusmu PKWT (kontrak waktu tertentu) atau PKWTT (karyawan tetap). Sesuai aturan ketenagakerjaan, masa percobaan (probation) maksimal 3 bulan.',
    badgeText: 'Status Hubungan Kerja',
  },
  {
    id: 'warning_no_ijazah_hold',
    category: 'keamanan',
    label: 'Waspadai Penahanan Ijazah Asli & Denda Penalti Resign',
    description: 'PENTING: Jangan pernah mau menyerahkan ijazah asli untuk ditahan perusahaan sebagai jaminan kerja. Cermati juga apakah ada denda pinalti jika mengundurkan diri sebelum masa kontrak usai.',
    badgeText: 'Krusial / Keamanan',
    alertLevel: 'critical',
  },
  {
    id: 'bpjs_and_benefits',
    category: 'keamanan',
    label: 'Jaminan BPJS Ketenagakerjaan & Kesehatan',
    description: 'Pastikan perusahaan mendaftarkan BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) dan BPJS Kesehatan sejak awal bekerja, serta tanyakan tunjangan hari raya (THR) dan asuransi tambahan.',
    badgeText: 'Benefit Karyawan',
  },
  {
    id: 'work_hours_overtime',
    category: 'keamanan',
    label: 'Jam Kerja, Skema Kerja & Kebijakan Lembur',
    description: 'Pastikan jam kerja normal (maks. 40 jam seminggu, misal 8 jam/hari) dan skema kerja (WFO / WFH / Hybrid). Tanyakan apakah jam lembur dihitung dan dibayarkan secara resmi.',
    badgeText: 'Jam Kerja & Skema',
  },
  {
    id: 'offering_deadline_reply',
    category: 'administrasi',
    label: 'Tenggat Waktu Konfirmasi Balasan Offering',
    description: 'Perhatikan batas waktu konfirmasi surat penawaran (umumnya 2 sampai 5 hari kerja). Jangan terburu-buru tanda tangan tanpa membaca tuntas seluruh halaman klausul kontrak.',
    badgeText: 'Tenggat Waktu',
  },
  {
    id: 'onboarding_documents',
    category: 'administrasi',
    label: 'Berkas Dokumen Administratif Onboarding',
    description: 'Siapkan scan/salinan KTP, NPWP, Halaman depan buku tabungan rekening bank (untuk payroll gajian), Kartu Keluarga, Ijazah/SKL, dan pas foto formal untuk keperluan HRD.',
    badgeText: 'Berkas Onboarding',
  },
];

interface OfferingPreparationModalProps {
  isOpen: boolean;
  app: ApplicationItem | null;
  onClose: () => void;
  onSave: (
    appId: string,
    data: {
      offeringSalary?: string;
      offeringDeadline?: string;
      offeringStartDate?: string;
      offeringNotes?: string;
      offeringChecklist?: string[];
    }
  ) => void;
}

type TabMode = 'checklist' | 'details' | 'templates';

export const OfferingPreparationModal: React.FC<OfferingPreparationModalProps> = ({
  isOpen,
  app,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('checklist');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [offeringSalary, setOfferingSalary] = useState('');
  const [offeringDeadline, setOfferingDeadline] = useState('');
  const [offeringStartDate, setOfferingStartDate] = useState('');
  const [offeringNotes, setOfferingNotes] = useState('');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Sinkronisasi data saat modal terbuka
  useEffect(() => {
    if (app && isOpen) {
      setChecklist(app.offeringChecklist || []);
      setOfferingSalary(app.salary !== '-' ? app.salary : '');
      setOfferingDeadline(app.offerDeadline || app.deadlineDate || '');
      setOfferingStartDate(app.offeringStartDate || '');
      setOfferingNotes(app.notes || '');
      setActiveTab('checklist');
      setCopiedTemplateId(null);
    }
  }, [app, isOpen]);

  // Handle tombol ESC untuk keluar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !app) return null;

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(app.id, {
      offeringSalary: offeringSalary.trim() || app.salary,
      offeringDeadline: offeringDeadline.trim() || undefined,
      offeringStartDate: offeringStartDate.trim() || undefined,
      offeringNotes: offeringNotes.trim() || undefined,
      offeringChecklist: checklist,
    });
    onClose();
  };

  const copyToClipboard = (text: string, templateId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTemplateId(templateId);
      setTimeout(() => setCopiedTemplateId(null), 3000);
    }
  };

  const completedCount = checklist.length;
  const totalCount = DEFAULT_OFFERING_CHECKLIST.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Template Email Balasan HRD Profesional
  const companyName = app.company || 'Perusahaan';
  const positionTitle = app.position || 'Posisi';

  const emailTemplates = [
    {
      id: 'accept',
      title: 'Konfirmasi Terima Offering (Acceptance)',
      description: 'Gunakan draf ini jika kamu menyetujui seluruh isi penawaran dan siap bergabung.',
      subject: `Konfirmasi Penerimaan Penawaran Kerja - ${positionTitle} - [Nama Kamu]`,
      body: `Yth. Tim HRD ${companyName},

Terima kasih banyak atas surat penawaran kerja (Offering Letter) untuk posisi ${positionTitle} yang saya terima.

Saya merasa sangat antusias dan dengan senang hati menerima penawaran kerja ini. Saya telah membaca dan menyetujui rincian kompensasi serta ketentuan kerja yang dilampirkan.

Sesuai informasi yang disampaikan, saya siap memulai hari pertama kerja pada [Tanggal Masuk, cth: 1 Oktober 2026]. Mohon informasikan apakah ada dokumen administratif tambahan atau berkas onboarding yang perlu saya lengkapi dan bawa sebelumnya.

Sekali lagi terima kasih atas kepercayaan dan kesempatan yang diberikan. Saya sangat menantikan kesempatan untuk berkontribusi secara optimal bersama tim ${companyName}.

Salam hormat,
[Nama Kamu]
[Nomor Telepon/WhatsApp]`,
    },
    {
      id: 'extension',
      title: 'Minta Perpanjangan Waktu Pertimbangan',
      description: 'Gunakan jika kamu butuh waktu 2-3 hari kerja ekstra untuk meninjau isi kontrak atau mendiskusikan dengan keluarga.',
      subject: `Permohonan Waktu Peninjauan Penawaran Kerja - ${positionTitle} - [Nama Kamu]`,
      body: `Yth. Tim HRD ${companyName},

Terima kasih banyak atas surat penawaran kerja untuk posisi ${positionTitle} yang telah dikirimkan kepada saya.

Saya sangat menghargai tawaran kerja sama ini. Agar saya dapat menelaah seluruh isi dokumen kontrak dan ketentuan secara menyeluruh bersama keluarga, apakah memungkinkan jika saya menyampaikan keputusan akhir paling lambat pada [Hari/Tanggal, cth: Kamis, 25 September 2026]?

Saya ingin memastikan seluruh persiapan telah matang agar dapat berkomitmen secara penuh saat memulai masa kerja nanti.

Terima kasih atas pengertian dan fleksibilitas Bapak/Ibu.

Salam hormat,
[Nama Kamu]
[Nomor Telepon/WhatsApp]`,
    },
    {
      id: 'negotiate',
      title: 'Negosiasi Gaji / Tunjangan Santun',
      description: 'Gunakan jika nominal atau benefit yang ditawarkan masih di bawah kisaran ekspektasimu secara realistis.',
      subject: `Diskusi Penawaran Kerja - ${positionTitle} - [Nama Kamu]`,
      body: `Yth. Tim HRD ${companyName},

Terima kasih banyak atas surat penawaran kerja untuk posisi ${positionTitle} yang telah diberikan. Saya sangat antusias dengan visi dan proyek yang akan dikerjakan bersama tim ${companyName}.

Setelah mempelajari rincian penawaran yang dilampirkan, saya ingin mendiskusikan mengenai komponen kompensasi. Menimbang ruang lingkup tanggung jawab peran ini serta pengalaman dan kontribusi yang dapat segera saya bawa, apakah terdapat ruang penyesuaian untuk gaji pokok ke kisaran [Nomor Ekspektasi, cth: Rp 5.000.000 - Rp 5.500.000] atau fasilitas pendukung seperti [cth: tunjangan transportasi/kesehatan]?

Saya sangat tertarik untuk bergabung dan berharap kita dapat menemukan titik temu yang terbaik bagi kedua belah pihak.

Terima kasih atas waktu dan keterbukaan Bapak/Ibu untuk berdiskusi lebih lanjut.

Salam hormat,
[Nama Kamu]
[Nomor Telepon/WhatsApp]`,
    },
    {
      id: 'decline',
      title: 'Menolak Offering Santun (Good Terms)',
      description: 'Gunakan jika kamu memutuskan mengambil kesempatan lain tanpa memutus relasi profesional.',
      subject: `Tanggapan Mengenai Penawaran Kerja - ${positionTitle} - [Nama Kamu]`,
      body: `Yth. Tim HRD ${companyName},

Terima kasih yang sebesar-besarnya atas waktu, proses seleksi yang sangat berharga, serta surat penawaran kerja untuk posisi ${positionTitle} di ${companyName}.

Setelah mempertimbangkan secara mendalam berbagai faktor dan arah fokus karier saya saat ini, dengan berat hati saya menyampaikan bahwa saya belum dapat menerima penawaran kerja ini karena telah memutuskan mengambil kesempatan lain yang lebih selaras dengan rencana jangka pendek saya.

Saya sangat terkesan dengan keramahan tim dan profesionalitas ${companyName} selama proses rekrutmen. Saya berharap kita dapat tetap menjaga hubungan baik dan membuka peluang kerja sama di masa yang akan datang.

Semoga ${companyName} selalu sukses dalam menemukan talenta terbaik dan terus berkembang.

Salam hormat,
[Nama Kamu]
[Nomor Telepon/WhatsApp]`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-3xl my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-white to-orange-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  Persiapan Masuk Offering
                </h3>
                <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  Tahap Akhir
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#1738D1] shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{app.company}</span>
                <span className="text-slate-400">•</span>
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{app.position}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist &amp; Telaah Kontrak</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {completedCount}/{totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Rincian Gaji &amp; Deadline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Draf Balasan Email HRD</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* TAB 1: CHECKLIST & TELAAH KONTRAK */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Progress Card */}
              <div className="p-3.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Kelengkapan Telaah Offering</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      {progressPercent}% Siap
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Centang hal-hal yang sudah kamu periksa sebelum menandatangani surat penawaran kerja.
                  </p>
                </div>
                <div className="w-full sm:w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Warning Alert Box: Penahanan Ijazah */}
              <div className="p-3.5 rounded-[10px] bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-100">
                    Aturan Emas Fresh Graduate: Jangan Mau Ijazah Asli Ditahan
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    Perusahaan profesional dan berizin resmi <strong>tidak akan pernah</strong> menahan ijazah asli sebagai jaminan kerja. Jika ada klausul penahanan dokumen asli atau denda resign jutaan rupiah yang tidak wajar, cermati dan tolak secara tegas sebelum tanda tangan.
                  </p>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {DEFAULT_OFFERING_CHECKLIST.map((item) => {
                  const isChecked = checklist.includes(item.id);
                  const isCritical = item.alertLevel === 'critical';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`p-3.5 rounded-[10px] border transition cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80'
                          : isCritical
                          ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-800/50 hover:border-rose-400'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className={`w-4 h-4 ${isCritical ? 'text-rose-400' : 'text-slate-400'}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isChecked
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : isCritical
                                ? 'text-rose-900 dark:text-rose-200'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-[8px] text-[10px] font-bold border shrink-0 ${
                              isCritical
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {item.badgeText}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RINCIAN GAJI & DEADLINE ONBOARDING */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kompensasi &amp; Batas Waktu Offering</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Nominal Gaji Ditawarkan
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Rp 4.500.000 / bulan (Gross)"
                      value={offeringSalary}
                      onChange={(e) => setOfferingSalary(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tenggat Waktu Konfirmasi (Deadline)
                    </label>
                    <TrackerDatePicker
                      value={offeringDeadline}
                      onChange={setOfferingDeadline}
                      placeholder="Pilih batas konfirmasi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Estimasi Tanggal Mulai Kerja (Start Date)
                  </label>
                  <TrackerDatePicker
                    value={offeringStartDate}
                    onChange={setOfferingStartDate}
                    placeholder="Pilih tanggal hari pertama masuk kerja"
                  />
                </div>
              </div>

              {/* Catatan Tambahan Khusus Kontrak */}
              <div className="p-3.5 rounded-[10px] bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Catatan Pribadi Mengenai Penawaran / Benefit Lain
                </label>
                <AutoResizeTextarea
                  value={offeringNotes}
                  onChange={(e) => setOfferingNotes(e.target.value)}
                  placeholder="Catat poin penting dari kontrak, misal: Masa probation 3 bulan dievaluasi berkala, tunjangan makan Rp 25.000/hari, laptop kantor disediakan..."
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1] transition"
                />
              </div>

              {/* Edukasi Singkat: Gross vs Nett */}
              <div className="p-3.5 rounded-[10px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-blue-900 dark:text-blue-200">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed space-y-1">
                  <p className="font-bold">Tips Membaca Slip Gaji Pertama:</p>
                  <p>
                    <strong>Gaji Gross</strong> adalah total sebelum potongan wajib BPJS Ketenagakerjaan (biasanya ~3%), BPJS Kesehatan (1%), dan PPh 21 (jika di atas PTKP). Sedangkan <strong>Gaji Nett</strong> adalah nominal bersih yang langsung masuk ke rekening bankmu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATE BALASAN EMAIL HRD */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                Pilih draf respons yang sesuai dengan keputusanmu. Klik <strong>Salin Draf</strong> untuk langsung menyalin ke clipboard dan gunakan saat membalas email HRD.
              </div>

              <div className="space-y-3">
                {emailTemplates.map((template) => {
                  const isCopied = copiedTemplateId === template.id;

                  return (
                    <div
                      key={template.id}
                      className="p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {template.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {template.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`Subject: ${template.subject}\n\n${template.body}`, template.id)}
                          className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#1738D1] hover:bg-[#132EA8] text-white shadow-xs'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Draf</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 font-mono text-[10.5px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-1.5">
                          Subject: {template.subject}
                        </div>
                        {template.body}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/30">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Semua checklist &amp; catatan tersimpan otomatis di Job Tracker.
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[10px] text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Persiapan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
