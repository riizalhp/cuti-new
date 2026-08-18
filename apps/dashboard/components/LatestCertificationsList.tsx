'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const LatestCertificationsList: React.FC = () => {
  const [registered, setRegistered] = useState<number[]>([]);

  const certs = [
    {
      id: 1,
      title: 'Microsoft Office Specialist (MOS)',
      issuer: 'Microsoft Corporation',
      duration: 'Ujian Online 90 Min',
      relevance: 'Tinggi (Admin & Kasir)',
      badge: 'Sertifikasi Internasional',
      desc: 'Sertifikasi keahlian Excel, Word, dan PowerPoint tingkat profesional.',
    },
    {
      id: 2,
      title: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      duration: 'Ujian Online 120 Min',
      relevance: 'Tinggi (IT & Cloud)',
      badge: 'Sertifikasi IT Global',
      desc: 'Validasi pemahaman mendasar infrastruktur komputasi awan AWS.',
    },
    {
      id: 3,
      title: 'Google Data Analytics Certificate',
      issuer: 'Google Career Certificates',
      duration: 'Program 3 Bulan',
      relevance: 'Sangat Tinggi (Data)',
      badge: 'Google Verified',
      desc: 'Ujian dan sertifikasi resmi pengolahan data, R, Tableau, dan SQL.',
    },
    {
      id: 4,
      title: 'TOEFL ITP Official Score',
      issuer: 'ETS (Educational Testing Service)',
      duration: 'Ujian TOEFL 2 Jam',
      relevance: 'Standar BUMN & Beasiswa',
      badge: 'Skor Min 500+',
      desc: 'Sertifikat kecakapan Bahasa Inggris resmi yang diakui instansi nasional.',
    },
    {
      id: 5,
      title: 'Sertifikasi Profesi BNSP (Badan Nasional Sertifikasi Profesi)',
      issuer: 'LSP & BNSP Republik Indonesia',
      duration: 'Asesmen 1 Hari',
      relevance: 'Standar Industri RI',
      badge: 'Resmi Negara',
      desc: 'Sertifikat kompetensi nasional untuk berbagai bidang profesi kerja.',
    },
  ];

  const handleRegister = (id: number) => {
    if (!registered.includes(id)) {
      setRegistered([...registered, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sertifikasi Terbaru &amp; Direkomendasikan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uji kompetensi resmi untuk meningkatkan trust skor CV kamu
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {certs.map((cert) => {
          const isReg = registered.includes(cert.id);
          return (
            <div
              key={cert.id}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-300 dark:hover:border-amber-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    {cert.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {cert.duration}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  {cert.title}
                </h4>
                <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  Penyelenggara: {cert.issuer}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {cert.desc}
                </p>
              </div>

              <button
                onClick={() => handleRegister(cert.id)}
                disabled={isReg}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-bold text-xs transition ${
                  isReg
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm'
                }`}
              >
                {isReg ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terdaftar Tes</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>Ambil Sertifikasi</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
