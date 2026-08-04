'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Search,
  Building2,
  CheckCircle2,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

export const LatestJobsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const jobs = [
    {
      id: 'kasir-toko',
      title: 'Kasir Toko',
      company: 'Minimarket Sentosa Jaya',
      location: 'Jakarta Selatan',
      salary: 'Rp 4.500.000 - Rp 5.200.000 / bulan',
      type: 'Full-time',
      posted: 'Baru saja',
      matchScore: '95%',
      desc: 'Melakukan transaksi penjualan kasir, merapikan barang display, pencatatan kas harian, dan memberikan pelayanan ramah kepada pelanggan.',
    },
    {
      id: 'admin-penjualan',
      title: 'Admin Penjualan',
      company: 'PT Niaga Logistik Nusantara',
      location: 'Jakarta Barat',
      salary: 'Rp 5.000.000 - Rp 6.500.000 / bulan',
      type: 'Full-time',
      posted: '1 jam lalu',
      matchScore: '92%',
      desc: 'Menginput data penjualan harian, membuat faktur tagihan pelanggan, merekap rekapitulasi stok barang, dan berkoordinasi dengan tim sales.',
    },
    {
      id: 'staff-gudang',
      title: 'Staff Gudang',
      company: 'CV Distribusi Utama',
      location: 'Tangerang Kota',
      salary: 'Rp 4.800.000 - Rp 5.500.000 / bulan',
      type: 'Full-time',
      posted: '3 jam lalu',
      matchScore: '88%',
      desc: 'Menerima pasokan barang masuk, melakukan packing pesanan out-bound, pengecekan nomor resi, dan menjaga kerapian area gudang.',
    },
    {
      id: 'kurir',
      title: 'Kurir Ekspedisi',
      company: 'Express Courier Indonesia',
      location: 'Bekasi Timur',
      salary: 'Rp 4.200.000 - Rp 6.000.000 / bulan',
      type: 'Full-time',
      posted: '5 jam lalu',
      matchScore: '85%',
      desc: 'Pengiriman paket ke alamat pelanggan tepat waktu, memastikan bukti penerimaan (POD) terunggah ke sistem, dan merawat kendaraan operasional.',
    },
    {
      id: 'barista',
      title: 'Barista',
      company: 'Kopi Kenangan Senja',
      location: 'Jakarta Pusat',
      salary: 'Rp 4.000.000 - Rp 5.000.000 / bulan',
      type: 'Full-time',
      posted: '1 hari lalu',
      matchScore: '90%',
      desc: 'Meracik minuman kopi dan non-kopi sesuai standar resep, merawat mesin espresso, menjaga kebersihan bar, dan melayani pelanggan dengan senyum.',
    },
  ];

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Lowongan Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lowongan terverifikasi sesuai kualifikasi profil kamu
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari posisi, perusahaan..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          return (
            <div
              key={job.id}
              className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      Match {job.matchScore}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {job.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {job.posted}
                  </span>
                </div>

                <div className="space-y-1.5 my-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {job.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {job.salary}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
                >
                  Detail
                </button>

                <button
                  onClick={() => handleApply(job.id)}
                  disabled={isApplied}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-bold text-xs transition shadow-sm ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
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
                      <span>Lamar Now</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              Match Score {selectedJob.matchScore}
            </span>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
              {selectedJob.title}
            </h3>
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-4">
              {selectedJob.company} • {selectedJob.location}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-lg space-y-2 text-xs mb-4">
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Estimasi Gaji:</strong> {selectedJob.salary}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Tipe Pekerjaan:</strong> {selectedJob.type}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Tanggal Tayang:</strong> {selectedJob.posted}
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Deskripsi &amp; Tanggung Jawab:
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
            >
              {appliedJobs.includes(selectedJob.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lamaran Telah Terkirim</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Lamaran Dengan CV ATS Saya</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
