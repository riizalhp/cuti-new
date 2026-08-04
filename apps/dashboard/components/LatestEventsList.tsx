'use client';

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const LatestEventsList: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const events = [
    {
      id: 1,
      title: 'National Virtual Job Fair 2026',
      organizer: 'CUTI & Kemenaker',
      date: '28 - 30 Juli 2026',
      time: '09:00 - 16:00 WIB',
      location: 'Virtual / Online Zoom',
      type: 'Job Fair',
      companiesCount: '50+ Perusahaan BUMN & Swasta',
      badge: 'Gratis Tiket',
      desc: 'Buka peluang melamar langsung ke puluhan recruiter perusahaan ternama se-Indonesia.',
    },
    {
      id: 2,
      title: 'Workshop AI Resume & Cover Letter Hacks',
      organizer: 'CUTI AI Team',
      date: '25 Juli 2026',
      time: '19:00 - 21:00 WIB',
      location: 'Live Google Meet',
      type: 'Workshop',
      companiesCount: 'Sertifikat e-Workshop',
      badge: 'Interactive Live',
      desc: 'Praktek langsung cara mengoptimalkan CV ATS friendly dengan kecerdasan buatan.',
    },
    {
      id: 3,
      title: 'Tech Hiring Day: Software & Data Talent',
      organizer: 'Indonesian Tech Alliance',
      date: '1 Agustus 2026',
      time: '10:00 - 17:00 WIB',
      location: 'BSD Green Office Park, Tangerang',
      type: 'Tech Hiring',
      companiesCount: '20+ Startup Unicorn',
      badge: 'Walk-in Interview',
      desc: 'Interview langsung di tempat bagi pengembang perangkat lunak & data spesialis.',
    },
    {
      id: 4,
      title: 'Career Fest & Talkshow Generasi Z',
      organizer: 'Youth Career Foundation',
      date: '5 Agustus 2026',
      time: '13:00 - 18:00 WIB',
      location: 'Grand Ballroom Jakarta',
      type: 'Career Fest',
      companiesCount: 'Keynote Speaker HR Top',
      badge: 'Networking Session',
      desc: 'Sesi inspirasi karir bersama praktisi HR senior dan konsultasi CV gratis.',
    },
    {
      id: 5,
      title: 'Virtual Interview Blitz: Retail & Admin',
      organizer: 'Konsorsium Ritel Nusantara',
      date: '8 Agustus 2026',
      time: '09:00 - 15:00 WIB',
      location: 'Online Portal',
      type: 'Virtual Interview',
      companiesCount: '15+ Perusahaan Ritel',
      badge: 'Fast Track HR',
      desc: 'Proses seleksi wawancara langsung tanpa perlu menunggu lama.',
    },
  ];

  const handleRegister = (id: number) => {
    if (!registeredEvents.includes(id)) {
      setRegisteredEvents([...registeredEvents, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Event Karir Terbaru &amp; Job Fair
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar acara pameran kerja, seminar, dan walk-in interview terdekat
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {events.map((ev) => {
          const isReg = registeredEvents.includes(ev.id);
          return (
            <div
              key={ev.id}
              className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    {ev.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {ev.badge}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  {ev.title}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  Penyelenggara: {ev.organizer}
                </p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ev.companiesCount}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {ev.desc}
                </p>
              </div>

              <button
                onClick={() => handleRegister(ev.id)}
                disabled={isReg}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs transition shadow-sm ${
                  isReg
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {isReg ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tiket Terkonfirmasi</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5 text-amber-300" />
                    <span>Daftar Acara (Gratis)</span>
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
