'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface PaymentViewProps {
  onPaymentSuccess?: () => void;
  onBackToDashboard?: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  onPaymentSuccess,
  onBackToDashboard,
}) => {
  // Plan Selection State
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  // Payment Method State
  const [paymentCategory, setPaymentCategory] = useState<'qris' | 'va' | 'card' | 'retail'>('qris');
  const [selectedVaBank, setSelectedVaBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri' | 'bsi'>('bca');
  const [selectedRetail, setSelectedRetail] = useState<'indomaret' | 'alfamart'>('indomaret');

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
  const [copiedCode, setCopiedCode] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Timer for QRIS / VA countdown
  const [timeLeft, setTimeLeft] = useState(899); // 14 mins 59 secs

  useEffect(() => {
    if (stepStatus === 'checkout') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stepStatus]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pricing Calculation
  const planPrices = {
    monthly: 49000,
    yearly: 348000, // Rp 29.000/bln
    lifetime: 499000,
  };

  const originalPrice = planPrices[selectedPlan];
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const adminFee = 0; // PPN & Layanan Gratis
  const totalPrice = Math.max(0, originalPrice - discountAmount + adminFee);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    const cleanCode = voucherCode.trim().toUpperCase();

    if (cleanCode === 'PRO2026' || cleanCode === 'CUTI') {
      setAppliedVoucher({
        code: cleanCode,
        discount: 50000,
        label: 'Diskon Spesial Promo Member - Rp 50.000',
      });
      setVoucherCode('');
    } else if (cleanCode === 'LOKER50') {
      const disc = Math.round(originalPrice * 0.2);
      setAppliedVoucher({
        code: cleanCode,
        discount: disc,
        label: 'Potongan 20% Voucher Karir',
      });
      setVoucherCode('');
    } else {
      setVoucherError('Kode voucher tidak ditemukan atau sudah kadaluarsa.');
    }
  };

  const handleProcessPayment = () => {
    setStepStatus('processing');
    const randomTrx = 'TRX-KK-' + Math.floor(100000 + Math.random() * 900000);
    setTransactionId(randomTrx);

    setTimeout(() => {
      setStepStatus('success');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 2000);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#0D3BD9] rounded-[10px] p-6 md:p-8 text-white border border-blue-500/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Crown className="w-3.5 h-3.5" />
              <span>CUTI Premium Pass</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Aktivasi Pembayaran Keanggotaan
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Selesaikan pembayaran secara aman dengan enkripsi SSL 256-bit. Dapatkan akses penuh ke fitur AI CV ATS, Simulasi Interview Voice, &amp; Prioritas Lamaran BUMN.
            </p>
          </div>

          <div className="px-4 py-3 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3 shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-300 font-bold uppercase block">Batas Pembayaran</span>
              <span className="text-base font-black text-amber-300 font-mono">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS STATE DISPLAY */}
      {stepStatus === 'success' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-8 text-center space-y-6 shadow-xl max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[10px] text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              PEMBAYARAN BERHASIL
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Selamat! Akun Kamu Telah Aktif
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Fitur CUTI Premium Pass telah berhasil diaktifkan. Bukti transaksi dan rincian lisensi telah dikirimkan ke email kamu.
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">ID Transaksi</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{transactionId}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Paket Dibelinya</span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">
                {selectedPlan === 'monthly' ? 'Pass Bulanan' : selectedPlan === 'yearly' ? 'Pass Tahunan Pro' : 'Pass Lifetime VIP'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Total Dibayar</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatRupiah(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status Akses</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Aktif
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onBackToDashboard) onBackToDashboard();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gunakan Fitur Premium Sekarang</span>
            </button>
            <button
              onClick={() => alert('Faktur PDF berhasil diunduh.')}
              className="w-full sm:w-auto px-5 py-3 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Bukti Bayar (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING STATE DISPLAY */}
      {stepStatus === 'processing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-12 text-center space-y-6 shadow-xl max-w-xl mx-auto my-12">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 animate-spin" />
            <RefreshCw className="w-6 h-6 text-violet-600 absolute inset-0 m-auto" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Memproses Pembayaran Kamu...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mohon tunggu sebentar, sistem sedang melakukan verifikasi transaksi secara otomatis.
            </p>
          </div>
        </div>
      )}

      {/* CHECKOUT FORM VIEW */}
      {stepStatus === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Step 1 Plan Selection & Step 2 Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Pilih Paket */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[10px] bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <span>Pilih Paket Keanggotaan</span>
                </h3>
                <span className="text-xs text-slate-400">Pilih opsi lisensi yang paling hemat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Monthly Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative ${
                    selectedPlan === 'monthly'
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Bulanan</span>
                    {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white block">Rp 49.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">/ bulan</span>
                  </div>
                </button>

                {/* Yearly Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative ${
                    selectedPlan === 'yearly'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-[10px] text-[9px] font-black uppercase bg-amber-400 text-slate-950 shadow-xs">
                    Rekomendasi Hemat 40%
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Tahunan Pro</span>
                    {selectedPlan === 'yearly' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">Rp 348.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Rp 29.000 / bln (Tagihan 1 thn)</span>
                  </div>
                </button>

                {/* Lifetime Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`p-4 rounded-[10px] border text-left transition flex flex-col justify-between space-y-3 relative ${
                    selectedPlan === 'lifetime'
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Lifetime VIP</span>
                    {selectedPlan === 'lifetime' && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white block">Rp 499.000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Sekali Bayar Seumur Hidup</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Pilih Metode Pembayaran */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[10px] bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <span>Pilih Metode Pembayaran</span>
                </h3>
                <span className="text-xs text-slate-400">Proses Instant &amp; Otomatis</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentCategory('qris')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentCategory === 'qris'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS / e-Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('va')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentCategory === 'va'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Virtual Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('card')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentCategory === 'card'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Kartu Kredit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentCategory('retail')}
                  className={`p-3 rounded-[10px] border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentCategory === 'retail'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Indomaret/Alfamart</span>
                </button>
              </div>

              {/* METHOD 1: QRIS */}
              {paymentCategory === 'qris' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Simulated QR Code Canvas */}
                    <div className="p-3 bg-white rounded-[10px] border-2 border-violet-500 shadow-md shrink-0 text-center">
                      <div className="w-36 h-36 bg-slate-900 rounded-[10px] p-2 flex flex-col items-center justify-center text-white relative">
                        <QrCode className="w-24 h-24 text-amber-400" />
                        <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase mt-1">
                          SCAN QRIS HERE
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 mt-2 block">QRIS National Standard</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Scan menggunakan e-Wallet favorit kamu:
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-violet-600">GoPay</span>
                        <span className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-orange-600">ShopeePay</span>
                        <span className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-purple-600">OVO</span>
                        <span className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sky-600">DANA</span>
                        <span className="px-2.5 py-1 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-rose-600">LinkAja</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                        Buka aplikasi e-Wallet atau m-Banking di HP kamu, pilih menu Scan QR, lalu arahkan kamera ke kode QR di atas. Pembayaran terverifikasi otomatis dalam 3 detik.
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
                          className={`p-2.5 rounded-[10px] border text-xs font-bold transition text-center ${
                            selectedVaBank === bank.id
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Nomor Virtual Account {selectedVaBank.toUpperCase()}</span>
                      <span className="text-base sm:text-lg font-mono font-black text-violet-600 dark:text-violet-400">
                        88001 812 3456 7890
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode('8800181234567890')}
                      className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Tersalin' : 'Salin Nomor'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 3: KARTU KREDIT */}
              {paymentCategory === 'card' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nomor Kartu Kredit / Debit</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
                        className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kode CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 4: RETAIL */}
              {paymentCategory === 'retail' && (
                <div className="p-5 rounded-[10px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRetail('indomaret')}
                      className={`px-4 py-2 rounded-[10px] border text-xs font-bold transition ${
                        selectedRetail === 'indomaret'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      Indomaret
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRetail('alfamart')}
                      className={`px-4 py-2 rounded-[10px] border text-xs font-bold transition ${
                        selectedRetail === 'alfamart'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      Alfamart / Lawson
                    </button>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kode Pembayaran Kasir {selectedRetail.toUpperCase()}</span>
                    <span className="text-lg font-mono font-black text-amber-500 block">KK2026-9921-3341</span>
                    <p className="text-slate-500 dark:text-slate-400">
                      Tunjukkan kode transaksi ini kepada kasir {selectedRetail === 'indomaret' ? 'Indomaret' : 'Alfamart'} terdekat dan sebutkan pembayaran &quot;CUTI Premium&quot;.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Step 3 Summary & Pay Action */}
          <div className="lg:col-span-5 space-y-6">
            {/* Rincian Tagihan Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] p-6 space-y-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Ringkasan Pesanan</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-[10px] text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Enkripsi SSL 256-Bit
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      CUTI Premium Pass ({selectedPlan === 'monthly' ? 'Bulanan' : selectedPlan === 'yearly' ? 'Tahunan Pro' : 'Lifetime VIP'})
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Akses AI CV ATS, Interview Voice Simulator, &amp; Prioritas Lamaran BUMN
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
                      className="text-[10px] font-bold text-rose-600 hover:underline"
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
                        placeholder="Contoh: PRO2026 atau LOKER50"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-[10px] bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition shrink-0"
                      >
                        Gunakan
                      </button>
                    </div>
                    {voucherError && <p className="text-[10px] font-bold text-rose-500 mt-1">{voucherError}</p>}
                  </form>
                )}

                {/* Cost Calculations */}
                <div className="pt-2 space-y-2 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Harga Subtotal</span>
                    <span>{formatRupiah(originalPrice)}</span>
                  </div>

                  {appliedVoucher && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Diskon Promo ({appliedVoucher.code})</span>
                      <span>-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Biaya Layanan &amp; PPN</span>
                    <span className="text-emerald-600 font-bold">GRATIS (Rp 0)</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold">Total Tagihan</span>
                    <span className="text-xl font-black text-violet-600 dark:text-violet-400">{formatRupiah(totalPrice)}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-[10px] text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Jaminan Lolos ATS 90%+
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-3.5 rounded-[10px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>Bayar {formatRupiah(totalPrice)} Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaksi dijamin 100% aman &amp; lisensi langsung aktif otomatis.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
