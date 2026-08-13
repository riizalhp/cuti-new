import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const INDO_MONTHS = [
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

interface CustomDatePickerProps {
  value: string; // e.g. "Januari 2024" or "Sekarang"
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowPresent?: boolean; // For End Date "Sekarang"
  align?: 'left' | 'right' | 'auto';
  minDate?: string; // Minimum allowed date
}

export const parseCVDate = (valStr: string): number | null => {
  if (!valStr) return null;
  const normalized = valStr.trim().toLowerCase();
  if (normalized === 'sekarang' || normalized === 'saat ini' || normalized === 'present') {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const parts = normalized.split(/\s+/);
  if (parts.length >= 2) {
    const yr = Number(parts[parts.length - 1]);
    const moStr = parts.slice(0, parts.length - 1).join(' ');
    const moIdx = INDO_MONTHS.findIndex(
      (m) => m.toLowerCase() === moStr || m.toLowerCase().slice(0, 3) === moStr
    );
    if (!isNaN(yr) && yr > 1900) {
      return yr * 12 + (moIdx >= 0 ? moIdx : 0);
    }
  }
  if (parts.length === 1 && !isNaN(Number(parts[0]))) {
    const yr = Number(parts[0]);
    if (yr > 1900) return yr * 12;
  }
  return null;
};

export const isEndDateBeforeStartDate = (startDateStr: string, endDateStr: string): boolean => {
  const startVal = parseCVDate(startDateStr);
  const endVal = parseCVDate(endDateStr);
  if (startVal === null || endVal === null) return false;
  return endVal < startVal;
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pilih Bulan & Tahun...',
  disabled = false,
  className = '',
  allowPresent = false,
  align = 'auto',
  minDate = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minDateVal = minDate ? parseCVDate(minDate) : null;
  const minYear = minDateVal !== null ? Math.floor(minDateVal / 12) : null;

  const parseMonthYear = (valStr: string) => {
    if (!valStr || valStr === 'Sekarang' || valStr === 'Saat Ini') {
      return { month: '', year: new Date().getFullYear() };
    }
    const parts = valStr.trim().split(' ');
    if (parts.length >= 2) {
      const yr = Number(parts[parts.length - 1]);
      const mo = parts.slice(0, parts.length - 1).join(' ');
      return { month: mo, year: isNaN(yr) ? new Date().getFullYear() : yr };
    }
    if (parts.length === 1 && !isNaN(Number(parts[0]))) {
      return { month: '', year: Number(parts[0]) };
    }
    return { month: '', year: new Date().getFullYear() };
  };

  const initial = parseMonthYear(value);
  const [selectedMonth, setSelectedMonth] = useState<string>(initial.month);
  const [selectedYear, setSelectedYear] = useState<number>(initial.year);

  useEffect(() => {
    const parsed = parseMonthYear(value);
    setSelectedMonth(parsed.month);
    if (parsed.year) setSelectedYear(parsed.year);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMonth = (m: string) => {
    setSelectedMonth(m);
    const newDateStr = `${m} ${selectedYear}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  const handleSelectYear = (y: number) => {
    setSelectedYear(y);
    if (selectedMonth) {
      onChange(`${selectedMonth} ${y}`);
    }
  };

  const handleSelectPresent = () => {
    onChange('Sekarang');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSelectedMonth('');
  };

  const popoverPositionClass =
    align === 'right' || allowPresent
      ? 'right-0 left-auto'
      : align === 'left'
      ? 'left-0 right-auto'
      : 'right-0 sm:right-0 sm:left-auto';

  const canGoPrevYear = minYear === null || (selectedYear - 1) >= minYear;
  const isValueInvalid = minDate ? isEndDateBeforeStartDate(minDate, value) : false;

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${isOpen ? 'z-40' : ''} ${className}`}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
          isValueInvalid
            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/50 dark:bg-rose-950/30'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
        } text-slate-800 dark:text-white text-xs font-medium shadow-2xs hover:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={`w-4 h-4 ${isValueInvalid ? 'text-rose-500' : 'text-orange-500'} shrink-0`} />
          <span className="truncate">
            {value ? (
              <span className={`font-semibold ${isValueInvalid ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{value}</span>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </span>
        </div>
        {value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div className={`absolute z-50 ${popoverPositionClass} w-72 sm:w-80 mt-1.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in-80 zoom-in-95 duration-150 text-xs`}>
          {/* Year Header Navigator */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={!canGoPrevYear}
              onClick={() => canGoPrevYear && handleSelectYear(selectedYear - 1)}
              className={`p-1.5 rounded-lg transition ${
                canGoPrevYear
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed text-slate-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => handleSelectYear(selectedYear + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Selector Grid */}
          <div className="grid grid-cols-3 gap-2">
            {INDO_MONTHS.map((m, mIdx) => {
              const isSelected = selectedMonth === m;
              const monthVal = selectedYear * 12 + mIdx;
              const isBeforeMin = minDateVal !== null && monthVal < minDateVal;

              return (
                <button
                  key={m}
                  type="button"
                  disabled={isBeforeMin}
                  onClick={() => !isBeforeMin && handleSelectMonth(m)}
                  title={isBeforeMin ? 'Tanggal selesai tidak boleh sebelum tanggal mulai' : undefined}
                  className={`py-2 px-1 rounded-xl text-center font-medium transition ${
                    isBeforeMin
                      ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 line-through'
                      : isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-md cursor-pointer'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Option for Present / Sekarang */}
          {allowPresent && (
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSelectPresent}
                className={`w-full py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  value === 'Sekarang'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Masih Aktif (Sekarang)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
