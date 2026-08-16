'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  CheckCircle2,
  Send,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const LatestJobsList: React.FC = () => {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const jobs = [
    {
      id: 'admin-penjualan',
      title: 'Admin Penjualan & Operations',
      company: 'PT Niaga Logistik Nusantara',
      location: 'Jakarta Barat',
      salary: 'Rp 5.000.000 - Rp 6.500.000 / bulan',
      type: 'Full-time',
      posted: 'Baru saja',
      matchScore: '95%',
      desc: 'Menginput data penjualan harian, membuat faktur tagihan pelanggan, merekap rekapitulasi stok barang, dan berkoordinasi dengan tim sales.',
    },
    {
      id: 'kasir-toko',
      title: 'Kasir & Customer Service',
      company: 'Minimarket Sentosa Jaya',
      location: 'Jakarta Selatan',
      salary: 'Rp 4.500.000 - Rp 5.200.000 / bulan',
      type: 'Full-time',
      posted: '1 jam lalu',
      matchScore: '92%',
      desc: 'Melakukan transaksi penjualan kasir, merapikan barang display, pencatatan kas harian, dan memberikan pelayanan ramah kepada pelanggan.',
    },
    {
      id: 'barista',
      title: 'Barista & Store Crew',
      company: 'Kopi Kenangan Senja',
      location: 'Jakarta Pusat',
      salary: 'Rp 4.000.000 - Rp 5.000.000 / bulan',
      type: 'Full-time',
      posted: '3 jam lalu',
      matchScore: '90%',
      desc: 'Meracik minuman kopi dan non-kopi sesuai standar resep, merawat mesin espresso, menjaga kebersihan bar, dan melayani pelanggan dengan senyum.',
    },
  ];

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[10px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-900/50">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Lowongan Paling Relevan Untukmu</span>
              <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                Match &gt;85%
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekomendasi teratas berdasarkan kualifikasi CV dan minat kariermu
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/match-cv')}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Cari Semua Lowongan</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {jobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          return (
            <div
              key={job.id}
              className="p-4 rounded-[10px] border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Match {job.matchScore}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {job.posted}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {job.title}
                </h4>

                <div className="space-y-1 my-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {job.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {job.salary}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 py-2 px-2 rounded-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border-0"
                >
                  Detail
                </button>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={isApplied}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-[10px] font-bold text-xs transition shadow-sm cursor-pointer border-0 ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terkirim</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Lamar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-[10px] text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Match Score {selectedJob.matchScore}
            </span>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
              {selectedJob.title}
            </h3>
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-4">
              {selectedJob.company} • {selectedJob.location}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-[10px] space-y-2 text-xs mb-4 border border-slate-100 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Estimasi Gaji:</strong> {selectedJob.salary}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Tipe Pekerjaan:</strong> {selectedJob.type}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Deskripsi Pekerjaan:
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedJob.desc}
              </p>
            </div>

            <button
              onClick={() => {
                handleApply(selectedJob.id);
                setSelectedJob(null);
              }}
              disabled={appliedJobs.includes(selectedJob.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-orange-500 hover:bg-orange-600 disabled:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer border-0"
            >
              {appliedJobs.includes(selectedJob.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lamaran Telah Terkirim</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Lamaran Dengan CV ATS</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
