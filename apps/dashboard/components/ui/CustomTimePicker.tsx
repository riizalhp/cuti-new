'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface CustomTimePickerProps {
  id?: string;
  value: string; // e.g. "08:30"
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right' | 'auto';
  placement?: 'bottom' | 'top' | 'auto';
  'aria-label'?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Pilih jam...',
  className = '',
  align = 'auto',
  placement = 'top',
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveAlign, setEffectiveAlign] = useState<'left' | 'right'>('left');

  // Parse hour & minute from value (e.g. "08:30")
  const { hour, minute } = useMemo(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      const h = parts[0]?.padStart(2, '0') || '08';
      const m = parts[1]?.slice(0, 2).padStart(2, '0') || '30';
      return { hour: h, minute: m };
    }
    return { hour: '08', minute: '30' };
  }, [value]);

  const [selectedHour, setSelectedHour] = useState<string>(hour);
  const [selectedMinute, setSelectedMinute] = useState<string>(minute);

  // Sync internal state when external value changes
  useEffect(() => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  }, [hour, minute]);

  // Alignment positioning
  const updateAlignment = () => {
    if (align === 'right') {
      setEffectiveAlign('right');
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 320;
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
      if (rect.left + popoverWidth > screenW - 16) {
        setEffectiveAlign('right');
        return;
      }
    }
    setEffectiveAlign('left');
  };

  useEffect(() => {
    if (isOpen) {
      updateAlignment();
    }
  }, [isOpen, align]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape key listener (A11y R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    onChange(`${h}:${selectedMinute}`);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    onChange(`${selectedHour}:${m}`);
  };

  const handlePresetSelect = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    setSelectedHour(h);
    setSelectedMinute(m);
    onChange(timeStr);
    setIsOpen(false);
  };

  const isOfficeHours = Number(selectedHour) >= 8 && Number(selectedHour) <= 16;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Box (Clickable everywhere, rounded-[10px], Bento card style) */}
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel || 'Pilih jam pengiriman'}
        onClick={() => {
          if (!isOpen) updateAlignment();
          setIsOpen((prev) => !prev);
        }}
        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cobalt-500/80 dark:hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 transition cursor-pointer flex items-center justify-between group shadow-2xs text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform" />
          <span className="truncate font-semibold text-xs text-slate-800 dark:text-slate-200 font-mono">
            {value ? `${value} WIB` : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Custom Time Picker */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute z-50 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-1.5'
          } ${
            effectiveAlign === 'right' ? 'right-0' : 'left-0'
          } w-[290px] sm:w-[320px] max-w-[calc(100vw-2rem)] p-3 sm:p-3.5 rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3 select-none`}
        >
          {/* Top Clock Display & Office Hours Status */}
          <div className="p-2.5 rounded-[8px] bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Jam Terpilih (WIB)
              </span>
              <div className="flex items-center gap-1 text-base font-bold font-mono text-cobalt-600 dark:text-blue-400 mt-0.5">
                <span>{selectedHour}</span>
                <span className="text-cobalt-400">:</span>
                <span>{selectedMinute}</span>
                <span className="text-caption font-semibold text-slate-500 ml-1">WIB</span>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isOfficeHours
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {isOfficeHours ? '🟢 Jam Kantor' : '🌙 Luar Kantor'}
            </span>
          </div>

          {/* Quick HRD Prime Slots (1-tap selection) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Rekomendasi Waktu HRD:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { time: '08:30', label: '08:30 WIB', desc: 'Awal Masuk' },
                { time: '10:00', label: '10:00 WIB', desc: 'Jeda Pagi' },
                { time: '13:30', label: '13:30 WIB', desc: 'Pasca Istirahat' },
                { time: '14:30', label: '14:30 WIB', desc: 'Sore Aktif' },
              ].map((slot) => {
                const isCurrent = value === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handlePresetSelect(slot.time)}
                    className={`p-2 rounded-[8px] text-left border transition cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-cobalt-500 bg-blue-50/80 dark:bg-blue-950/80 text-cobalt-800 dark:text-blue-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-bold">{slot.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{slot.desc}</div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-cobalt-600 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Hour & Minute Pickers */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Hour Column */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 text-center">
                Jam
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 p-1 rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                {HOURS.map((hr) => {
                  const isSelected = selectedHour === hr;
                  return (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => handleHourSelect(hr)}
                      className={`w-full py-1 px-2 rounded-[6px] text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cobalt-500 text-white font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 font-medium'
                      }`}
                    >
                      <span>{hr}:00</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Column */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 text-center">
                Menit
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 p-1 rounded-[8px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                {MINUTES.map((mn) => {
                  const isSelected = selectedMinute === mn;
                  return (
                    <button
                      key={mn}
                      type="button"
                      onClick={() => handleMinuteSelect(mn)}
                      className={`w-full py-1 px-2 rounded-[6px] text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cobalt-500 text-white font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 font-medium'
                      }`}
                    >
                      <span>:{mn}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Selesai Action */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {selectedHour}:{selectedMinute} WIB
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-[8px] bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
