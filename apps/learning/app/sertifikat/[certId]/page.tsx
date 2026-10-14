'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Award,
  Printer,
  Share2,
  ShieldCheck,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Button } from '@/components/ui/button';

export default function CertificateDetailPage() {
  const params = useParams();
  const certId = (params?.certId as string) || 'EMP-2026-META-7712';

  const studentName = 'Ahmad Kasyaf';
  const issueDate = '12 Agustus 2026';
  const courseTitle = 'Meta Front-End Developer Professional Certificate';
  const partnerName = 'Meta Platforms Inc. & Employr Learning Academy';
  const instructorName = 'Meta Lead Software Engineering Team';

  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Sertifikat Resmi: ${courseTitle} oleh ${studentName}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
  };

  return (
    <LayoutWrapper>
      {/* Top Actions Bar */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-xs">
        <Link
          href="/saya"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cobalt-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor Saya</span>
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handlePrint}
            size="sm"
            className="flex-1 sm:flex-none text-xs font-bold gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Unduh PDF</span>
          </Button>

          <Button
            onClick={handleShareLinkedIn}
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none text-xs font-bold gap-1.5 bg-[#0A66C2] hover:bg-[#084e96] text-white dark:bg-[#0A66C2] dark:hover:bg-[#084e96] dark:text-white"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan ke LinkedIn</span>
          </Button>
        </div>
      </div>

      {/* Official Printable Certificate Canvas */}
      <div className="print-certificate-area relative bg-white text-slate-950 p-6 sm:p-12 md:p-14 rounded-[10px] border-8 border-double border-slate-300 shadow-xl overflow-hidden space-y-6 sm:space-y-8">
        {/* Certificate Header Watermark & Border Accents */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-5 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-cobalt-500 text-white flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                EMPLOYR LEARNING ACADEMY
              </h2>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Verified Digital Certificate of Completion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] sm:text-xs font-extrabold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KREDENSIAL TERVERIFIKASI</span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-3 sm:space-y-4 py-2 sm:py-4">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
            Sertifikat Ini Diberikan Kepada:
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif italic">
            {studentName}
          </h1>
          <p className="text-caption sm:text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
            Atas keberhasilan menyelesaikan seluruh silabus kurikulum, kuis latihan interaktif, dan evaluasi pemahaman dengan nilai kelulusan prima pada program spesialisasi:
          </p>

          <div className="py-1">
            <h3 className="text-base sm:text-2xl font-black text-cobalt-500 tracking-tight">
              {courseTitle}
            </h3>
            <p className="text-caption sm:text-xs font-bold text-slate-700 mt-1">
              Diselenggarakan bersama {partnerName}
            </p>
          </div>
        </div>

        {/* Signatures & QR Code Verification Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 pt-6 sm:pt-8 border-t-2 border-slate-200 items-end">
          {/* Instructor Signature */}
          <div className="text-center sm:text-left space-y-1">
            <div className="h-8 sm:h-10 flex items-end justify-center sm:justify-start">
              <span className="font-serif italic font-bold text-slate-700 text-base sm:text-lg">
                Andrew Ng / Meta Lead
              </span>
            </div>
            <div className="w-full border-t border-slate-400 pt-1">
              <p className="text-xs font-bold text-slate-900">{instructorName}</p>
              <p className="text-[10px] text-slate-500">Lead Academic Instructor</p>
            </div>
          </div>

          {/* QR Verification Box */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 border border-slate-300 rounded-[6px] flex items-center justify-center p-1">
              <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-bold">
              SCAN TO VERIFY
            </span>
          </div>

          {/* Credential ID & Date */}
          <div className="text-center sm:text-right space-y-0.5">
            <p className="text-[10px] text-slate-500 font-medium">Tanggal Penerbitan:</p>
            <p className="text-xs font-bold text-slate-900">{issueDate}</p>
            <div className="pt-0.5">
              <p className="text-[10px] text-slate-500 font-medium">ID Kredensial Resmi:</p>
              <p className="text-xs font-mono font-bold text-cobalt-500">{certId}</p>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
