'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Store,
  ArrowRight,
  Copy,
  Clock,
  Check,
  Tag,
  Receipt,
  Download,
  Lock,
  Zap,
  HelpCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  Award,
  RefreshCw,
  Mic,
  Briefcase,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface PaymentViewProps {
  onPaymentSuccess?: () => void;
  onBackToDashboard?: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  onPaymentSuccess,
  onBackToDashboard,
}) => {
  const toast = useToast();
  // Plan Selection State: 'siap_kerja' | 'profesional' | 'siap_lamar'
  const [selectedPlan, setSelectedPlan] = useState<'siap_kerja' | 'profesional' | 'siap_lamar'>('siap_kerja');

  // Payment Method State: 'qris' | 'va' | 'card' | 'retail'
  const [paymentCategory, setPaymentCategory] = useState<'qris' | 'va' | 'card' | 'retail'>('qris');
  const [selectedVaBank, setSelectedVaBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri' | 'bsi'>('bca');
  const [selectedRetail, setSelectedRetail] = useState<'indomaret' | 'alfamart'>('indomaret');
  const [showVaGuide, setShowVaGuide] = useState(false);

  // Voucher Code State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Card Details State
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardName: '',
    expDate: '',
    cvv: '',
  });

  // Step Status: 'checkout' | 'processing' | 'success'
  const [stepStatus, setStepStatus] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [processingStage, setProcessingStage] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Timer for countdown (14m 59s)
  const [timeLeft, setTimeLeft] = useState(899);

  // Read pre-applied promo code if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPromo = localStorage.getItem('promo_claimed_code');
      if (storedPromo) {
        if (storedPromo.toUpperCase() === 'PRO2026' || storedPromo.toUpperCase() === 'CUTI') {
          setAppliedVoucher({
            code: storedPromo.toUpperCase(),
            discount: 20000,
            label: 'Diskon Spesial Promo Member - Rp 20.000',
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (stepStatus === 'checkout') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 899));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stepStatus]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pricing Matrix (Single Lifetime Payment as per Business Rules)
  const planPrices: Record<'siap_kerja' | 'profesional' | 'siap_lamar', { price: number; name: string; tag: string }> = {
    siap_kerja: {
      price: 99000,
      name: 'Paket Siap Kerja',
      tag: 'Paling Lengkap & Rekomendasi',
    },
    profesional: {
      price: 59000,
      name: 'CV Profesional',
      tag: 'Paling Populer',
    },
    siap_lamar: {
      price: 19000,
      name: 'CV Siap Lamar',
      tag: 'Starter',
    },
  };

  const originalPrice = planPrices[selectedPlan].price;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const adminFee = 0; // Bebas biaya admin
  const totalPrice = Math.max(0, originalPrice - discountAmount + adminFee);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    const cleanCode = voucherCode.trim().toUpperCase();

    if (cleanCode === 'PRO2026' || cleanCode === 'CUTI') {
      setAppliedVoucher({
        code: cleanCode,
        discount: 20000,
        label: 'Diskon Spesial Promo Member - Rp 20.000',
      });
      setVoucherCode('');
    } else if (cleanCode === 'BUMN2026' || cleanCode === 'LOKER50') {
      const disc = Math.round(originalPrice * 0.25);
      setAppliedVoucher({
        code: cleanCode,
        discount: disc,
        label: 'Potongan 25% Spesial Persiapan Kerja',
      });
      setVoucherCode('');
    } else {
      setVoucherError('Kode voucher tidak ditemukan atau sudah kadaluarsa.');
    }
  };

  const handleProcessPayment = () => {
    setStepStatus('processing');
    setProcessingStage(1);
    const randomTrx = 'TRX-CUTI-' + Math.floor(100000 + Math.random() * 900000);
    setTransactionId(randomTrx);

    setTimeout(() => {
      setProcessingStage(2);
    }, 900);

    setTimeout(() => {
      setProcessingStage(3);
    }, 1800);

    setTimeout(() => {
      setStepStatus('success');
      if (typeof window !== 'undefined') {
        localStorage.setItem('cuti_is_pro_member', 'true');
        localStorage.setItem('cuti_membership_plan', selectedPlan);
      }
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 2600);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getVaNumber = (bank: string) => {
    switch (bank) {
      case 'bca':
        return '88001 812 3456 7890';
      case 'mandiri':
        return '89508 812 3456 7890';
      case 'bni':
        return '88100 812 3456 7890';
      case 'bri':
        return '88017 812 3456 7890';
      case 'bsi':
        return '88701 812 3456 7890';
      default:
        return '88001 812 3456 7890';
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header with User Requested Copy */}
      <div className="bg-navy-700 rounded-[10px] p-6 sm:p-8 text-white border border-navy-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Crown className="w-3.5 h-3.5" />
              <span>CUTI Premium Pass</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Aktivasi Pembayaran Keanggotaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Selesaikan pembayaran secara aman dengan enkripsi SSL 256-bit. Dapatkan akses penuh ke fitur AI CV ATS, Simulasi Interview Voice, &amp; Prioritas Lamaran BUMN.
            </p>
          </div>

          <div className="px-4 py-3.5 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-start">
            <div className="w-9 h-9 rounded-[8px] bg-amber-400/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Batas Pembayaran</span>
              <span className="text-lg font-black text-amber-300 font-mono tracking-tight">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS STATE DISPLAY */}
      {stepStatus === 'success' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 sm:p-10 text-center space-y-6 shadow-xl max-w-2xl mx-auto my-8 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              PEMBAYARAN BERHASIL DIVERIFIKASI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Selamat! Akun Kamu Resmi Menjadi Member
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Fitur CUTI Premium Pass telah aktif selamanya di akun kamu. Akses AI CV ATS, Simulasi Interview Voice, dan prioritas lamaran langsung terbuka.
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">ID Transaksi</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{transactionId}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Paket Terpilih</span>
              <span className="font-black text-slate-900 dark:text-white uppercase">
                {planPrices[selectedPlan].name} (Sekali Bayar)
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Total Dibayar</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatRupiah(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status Keanggotaan</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Lifetime Member (Aktif Selamanya)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onBackToDashboard) {
                  onBackToDashboard();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/beranda';
                }
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Gunakan Fitur Member di Dashboard</span>
            </button>
            <button
              onClick={() => toast.success('Kuitansi Siap', `Bukti pembayaran untuk ID ${transactionId} berhasil dicetak.`)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Kuitansi (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING STATE DISPLAY */}
      {stepStatus === 'processing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-8 sm:p-14 text-center space-y-6 shadow-xl max-w-lg mx-auto my-12 animate-in zoom-in-95 duration-200">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-[#1738D1] animate-spin" />
            <RefreshCw className="w-6 h-6 text-[#1738D1] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Memproses Pembayaran Kamu...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {processingStage === 1 && 'Menghubungkan ke gateway pembayaran Bank Indonesia...'}
              {processingStage === 2 && 'Melakukan validasi keamanan enkripsi SSL 256-bit...'}
              {processingStage === 3 && 'Mengaktifkan hak akses lisensi ke akun kamu...'}
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#1738D1] h-full transition-all duration-700"
              style={{ width: processingStage === 1 ? '35%' : processingStage === 2 ? '75%' : '100%' }}
            />
          </div>
        </div>
      )}

      {/* CHECKOUT FORM VIEW */}
      {stepStatus === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Step 1 Plan Selection & Step 2 Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Pilih Paket Keanggotaan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[8px] bg-navy-700 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>Pilih Paket Keanggotaan</span>
                </h2>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Sekali Bayar Selamanya
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Paket Siap Kerja */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('siap_kerja')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative cursor-pointer ${
                    selectedPlan === 'siap_kerja'
                      ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-[6px] text-[9px] font-black uppercase bg-amber-400 text-slate-950 shadow-xs">
                    Rekomendasi
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 dark:text-white">Siap Kerja</span>
                    {selectedPlan === 'siap_kerja' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1738D1]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-black text-[#1738D1] dark:text-blue-400 block">Rp 99.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Akses Penuh Selamanya</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> AI CV ATS + Voice Interview
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Prioritas BUMN &amp; Startup
                    </span>
                  </div>
                </button>

                {/* 2. CV Profesional */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('profesional')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative cursor-pointer ${
                    selectedPlan === 'profesional'
                      ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 dark:text-white">CV Profesional</span>
                    {selectedPlan === 'profesional' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1738D1]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white block">Rp 59.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Lifetime Access</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Pembuat CV ATS Unlimited
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Job Tracker &amp; Match
                    </span>
                  </div>
                </button>

                {/* 3. CV Siap Lamar */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('siap_lamar')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative cursor-pointer ${
                    selectedPlan === 'siap_lamar'
                      ? 'border-[#1738D1] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1738D1]/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 dark:text-white">CV Siap Lamar</span>
                    {selectedPlan === 'siap_lamar' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1738D1]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white block">Rp 19.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Starter Pack</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" /> 1x Penyusunan CV ATS
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Ekspor Standar PDF
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Pilih Metode Pembayaran */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[8px] bg-navy-700 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <span>Pilih Metode Pembayaran</span>
                </h2>
                <span className="text-xs text-slate-400">Verifikasi Otomatis 24/7</span>
              </div>

              {/* Payment Categories Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentCategory('qris')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentCategory === 'qris'
                      ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS / e-Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('va')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentCategory === 'va'
                      ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Virtual Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('card')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentCategory === 'card'
                      ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Kartu Kredit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('retail')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    paymentCategory === 'retail'
                      ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Minimarket</span>
                </button>
              </div>

              {/* METHOD 1: QRIS */}
              {paymentCategory === 'qris' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Simulated QR Code Box */}
                    <div className="p-3.5 bg-white rounded-[10px] border-2 border-[#1738D1] shadow-md shrink-0 text-center">
                      <div className="w-40 h-40 bg-slate-900 rounded-[10px] p-2 flex flex-col items-center justify-center text-white relative">
                        <QrCode className="w-28 h-28 text-amber-400" />
                        <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase mt-1">
                          SCAN QRIS DISINI
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 mt-2 block">
                        Standar QRIS Nasional
                      </span>
                    </div>

                    <div className="space-y-3 text-xs flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Scan menggunakan aplikasi pembayaran kamu:
                      </h3>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-blue-600">GoPay</span>
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-orange-600">ShopeePay</span>
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-navy-700 dark:text-navy-300">OVO</span>
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sky-600">DANA</span>
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-rose-600">LinkAja</span>
                        <span className="px-2.5 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600">m-Banking (BCA/Mandiri/BRI)</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                        Buka aplikasi e-Wallet atau mobile banking, pilih fitur <strong>Scan QR</strong>, lalu arahkan kamera ke barcode. Transaksi langsung diverifikasi secara otomatis dalam hitungan detik.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: VIRTUAL ACCOUNT */}
              {paymentCategory === 'va' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Bank Transfer:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'bca', name: 'BCA VA' },
                        { id: 'mandiri', name: 'Mandiri VA' },
                        { id: 'bni', name: 'BNI VA' },
                        { id: 'bri', name: 'BRI VA' },
                        { id: 'bsi', name: 'BSI VA' },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedVaBank(bank.id as any)}
                          className={`p-2.5 rounded-[10px] border text-xs font-bold transition text-center cursor-pointer ${
                            selectedVaBank === bank.id
                              ? 'bg-[#1738D1] text-white border-[#1738D1] shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Nomor Virtual Account {selectedVaBank.toUpperCase()}
                      </span>
                      <span className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white">
                        {getVaNumber(selectedVaBank)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(getVaNumber(selectedVaBank).replace(/\s+/g, ''))}
                      className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Tersalin' : 'Salin Nomor VA'}</span>
                    </button>
                  </div>

                  {/* VA Guide Accordion */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowVaGuide(!showVaGuide)}
                      className="text-[11px] font-bold text-[#1738D1] dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Lihat panduan transfer {selectedVaBank.toUpperCase()}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVaGuide ? 'rotate-180' : ''}`} />
                    </button>

                    {showVaGuide && (
                      <ol className="list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 mt-2.5 pl-1 leading-relaxed">
                        <li>Buka aplikasi m-Banking atau ATM {selectedVaBank.toUpperCase()}.</li>
                        <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                        <li>Masukkan nomor VA: <strong>{getVaNumber(selectedVaBank)}</strong>.</li>
                        <li>Pastikan nama penerima tertulis <strong>AmbilCUTI / {planPrices[selectedPlan].name}</strong> dengan nominal <strong>{formatRupiah(totalPrice)}</strong>.</li>
                        <li>Konfirmasi PIN transaksi kamu. Status akan terupdate otomatis.</li>
                      </ol>
                    )}
                  </div>
                </div>
              )}

              {/* METHOD 3: KARTU KREDIT / DEBIT */}
              {paymentCategory === 'card' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nomor Kartu (Visa / Mastercard / JCB)</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Masa Berlaku (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardForm.expDate}
                        onChange={(e) => setCardForm({ ...cardForm, expDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kode CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Data kartu dienkripsi penuh dengan standar keamanan PCI-DSS Tier 1.</span>
                  </p>
                </div>
              )}

              {/* METHOD 4: RETAIL */}
              {paymentCategory === 'retail' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRetail('indomaret')}
                      className={`px-4 py-2 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                        selectedRetail === 'indomaret'
                          ? 'bg-[#1738D1] text-white border-[#1738D1]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Indomaret
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRetail('alfamart')}
                      className={`px-4 py-2 rounded-[10px] border text-xs font-bold transition cursor-pointer ${
                        selectedRetail === 'alfamart'
                          ? 'bg-[#1738D1] text-white border-[#1738D1]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Alfamart / Lawson
                    </button>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Kode Pembayaran Kasir {selectedRetail.toUpperCase()}
                    </span>
                    <span className="text-lg font-mono font-black text-amber-500 block">
                      CUTI2026-9921-3341
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Tunjukkan kode transaksi ini kepada kasir {selectedRetail === 'indomaret' ? 'Indomaret' : 'Alfamart'} terdekat dan sebutkan pembayaran <strong>AmbilCUTI Member</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Step 3 Summary & Pay Action */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rincian Tagihan Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-5 sm:p-6 space-y-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#1738D1]" />
                  <span>Ringkasan Pesanan</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-[6px] text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Enkripsi SSL 256-Bit
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {planPrices[selectedPlan].name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedPlan === 'siap_kerja'
                        ? 'Akses Semua Fitur AI CV ATS, Voice Simulator, & Prioritas BUMN'
                        : selectedPlan === 'profesional'
                        ? 'Akses Pengoptimal CV ATS, Job Tracker & Auto-Match'
                        : 'Penyusunan CV ATS Standar & Ekspor PDF'}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                    {formatRupiah(originalPrice)}
                  </span>
                </div>

                {/* Voucher Applied info */}
                {appliedVoucher && (
                  <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 block">{appliedVoucher.code}</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400">{appliedVoucher.label}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* Voucher Input */}
                {!appliedVoucher && (
                  <form onSubmit={handleApplyVoucher} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Punya Kode Promo / Voucher?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: PRO2026 atau BUMN2026"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1738D1]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-[10px] bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition shrink-0 cursor-pointer"
                      >
                        Pakai
                      </button>
                    </div>
                    {voucherError && <p className="text-[10px] font-bold text-rose-500 mt-1">{voucherError}</p>}
                  </form>
                )}

                {/* Cost Calculations */}
                <div className="pt-2 space-y-2 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Harga Paket</span>
                    <span>{formatRupiah(originalPrice)}</span>
                  </div>

                  {appliedVoucher && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Diskon Voucher ({appliedVoucher.code})</span>
                      <span>-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Biaya Transaksi &amp; Layanan</span>
                    <span className="text-emerald-600 font-bold">GRATIS (Rp 0)</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Total Pembayaran</span>
                    <span className="text-xl font-black text-[#1738D1] dark:text-blue-400">{formatRupiah(totalPrice)}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Akses Lifetime
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-3.5 rounded-[10px] bg-[#1738D1] hover:bg-[#132EA8] text-white font-black text-xs transition shadow-lg shadow-[#1738D1]/20 flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>Bayar {formatRupiah(totalPrice)} Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Enkripsi SSL 256-bit &amp; verifikasi transaksi langsung otomatis.</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Garansi kepuasan &amp; jaminan bebas langganan berulang.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
