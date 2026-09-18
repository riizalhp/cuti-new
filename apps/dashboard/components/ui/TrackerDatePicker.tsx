'use client';

import React, { useRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

interface TrackerDatePickerProps {
  value: string; // "10 September 2026" or "Hari ini" or ISO "2026-09-10"
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
}

// Helper konversi "10 September 2026" -> "2026-09-10"
export const toISODate = (val: string): string => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parts = val.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const year = Number(parts[2]);
    const mIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase());
    if (!isNaN(day) && !isNaN(year) && mIdx >= 0) {
      return `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return '';
};

// Helper konversi "2026-09-10" -> "10 September 2026"
export const fromISODate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
      return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
    }
  }
  return iso;
};

export const TrackerDatePicker: React.FC<TrackerDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize display value
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return fromISODate(value);
    }
    return value;
  }, [value]);

  const isoValue = React.useMemo(() => toISODate(value), [value]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      } catch {
        inputRef.current.focus();
      }
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    if (iso) {
      onChange(fromISODate(iso));
    } else {
      onChange('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Clickable UI container conforming to Design System */}
      <div
        onClick={handleContainerClick}
        className="w-full px-3 py-2.5 text-xs rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-[#1738D1] dark:hover:border-[#3B5CC4] focus-within:ring-2 focus-within:ring-[#1738D1] transition select-none group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CalendarIcon className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform" />
          <span
            className={`truncate font-semibold ${
              displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 font-normal'
            }`}
          >
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {displayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Hapus tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden native input for reliable showPicker functionality across devices */}
      <input
        ref={inputRef}
        type="date"
        value={isoValue}
        onChange={handleNativeChange}
        className="sr-only absolute pointer-events-none opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};
