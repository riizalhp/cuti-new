'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown, Check } from 'lucide-react';

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

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface TrackerDatePickerProps {
  id?: string;
  value: string; // e.g. "10 September 2026" or ISO "2026-09-10"
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right' | 'auto';
  placement?: 'bottom' | 'top' | 'auto';
  showPresets?: boolean;
  minYear?: number;
  maxYear?: number;
  outputFormat?: 'readable' | 'iso';
  'aria-label'?: string;
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
  id,
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  className = '',
  align = 'auto',
  placement = 'bottom',
  showPresets = true,
  minYear = 1950,
  maxYear,
  outputFormat = 'readable',
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveAlign, setEffectiveAlign] = useState<'left' | 'right'>(
    align === 'right' ? 'right' : 'left'
  );

  const updateAlignment = () => {
    if (align === 'right') {
      setEffectiveAlign('right');
      return;
    }
    if (align === 'left') {
      setEffectiveAlign('left');
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = typeof window !== 'undefined' && window.innerWidth >= 640 ? 310 : 288;
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;

      // Cari pembatas horizontal terdekat (misal slide-in drawer Sheet / dialog / form)
      const boundaryEl = containerRef.current.closest<HTMLElement>(
        '[role="dialog"], [data-sheet-content], aside, form'
      );
      const boundaryRect = boundaryEl ? boundaryEl.getBoundingClientRect() : null;

      const maxRight = boundaryRect
        ? Math.min(screenW - 16, boundaryRect.right - 12)
        : screenW - 16;
      const minLeft = boundaryRect
        ? Math.max(16, boundaryRect.left + 12)
        : 16;

      const fitsLeft = rect.left + popoverWidth <= maxRight;
      const fitsRight = rect.right - popoverWidth >= minLeft;

      // Hanya ganti ke kanan jika membuka ke kanan (left-0) meluap keluar batas kontainer,
      // dan membuka ke kiri (right-0) muat di dalam batas kiri kontainer
      if (!fitsLeft && fitsRight) {
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

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => updateAlignment();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, align]);

  // Parse current value to determine initial calendar view
  const parsedDate = useMemo(() => {
    const iso = toISODate(value);
    if (iso) {
      const parts = iso.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return null;
  }, [value]);

  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState<number>(() =>
    parsedDate ? parsedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    parsedDate ? parsedDate.getMonth() : today.getMonth()
  );

  const currentYear = today.getFullYear();
  const effectiveMaxYear = maxYear ?? currentYear + 5;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, effectiveMaxYear]);

  // Dropdown states for custom Month & Year selectors
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const selectedYearButtonRef = useRef<HTMLButtonElement>(null);

  // Close inner dropdowns if main popover closes
  useEffect(() => {
    if (!isOpen) {
      setIsMonthOpen(false);
      setIsYearOpen(false);
    }
  }, [isOpen]);

  // Click outside listener for month & year dropdowns
  useEffect(() => {
    const handleClickOutsideDropdowns = (e: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target as Node)) {
        setIsMonthOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) {
        setIsYearOpen(false);
      }
    };
    if (isMonthOpen || isYearOpen) {
      document.addEventListener('mousedown', handleClickOutsideDropdowns);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideDropdowns);
  }, [isMonthOpen, isYearOpen]);

  // Auto-scroll to selected year in dropdown
  useEffect(() => {
    if (isYearOpen && selectedYearButtonRef.current && yearListRef.current) {
      selectedYearButtonRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [isYearOpen]);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

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

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMonthOpen || isYearOpen) {
          setIsMonthOpen(false);
          setIsYearOpen(false);
          e.stopPropagation();
          return;
        }
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMonthOpen, isYearOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const formatted =
      outputFormat === 'iso'
        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        : `${day} ${MONTH_NAMES[month]} ${year}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const formatted =
      outputFormat === 'iso'
        ? `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
        : `${target.getDate()} ${MONTH_NAMES[target.getMonth()]} ${target.getFullYear()}`;
    onChange(formatted);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Compute days matrix for the month
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Monday-based offset (Sen=0, Sel=1, ..., Min=6)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Previous month trailing days
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Fill leading days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Fill current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      const isSelected =
        parsedDate !== null &&
        d === parsedDate.getDate() &&
        viewMonth === parsedDate.getMonth() &&
        viewYear === parsedDate.getFullYear();

      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    // Fill trailing days to complete 6 rows (42 items) or 5 rows
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, today, parsedDate]);

  const displayValue = value ? fromISODate(value) : '';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Clickable Input Trigger conforming to Employr Design System */}
      <div
        className={`w-full px-3.5 py-2.5 rounded-[10px] border ${
          isOpen
            ? 'border-cobalt-500 ring-2 ring-cobalt-500/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white flex items-center justify-between transition select-none group`}
      >
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={ariaLabel || placeholder}
          onClick={() => {
            if (!isOpen) updateAlignment();
            setIsOpen((prev) => !prev);
          }}
          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer rounded-[6px] text-base sm:text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform" />
          <span
            className={`truncate font-semibold ${
              displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 font-normal dark:text-slate-400'
            }`}
          >
            {displayValue || placeholder}
          </span>
        </button>

        {displayValue && (
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-[6px] text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer dark:text-slate-400"
              title="Hapus tanggal"
              aria-label="Hapus tanggal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute z-50 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-1.5'
          } ${
            effectiveAlign === 'right' ? 'right-0' : 'left-0'
          } w-[288px] sm:w-[310px] max-w-[calc(100vw-2.5rem)] p-3 sm:p-3.5 rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800 gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              title="Bulan sebelumnya"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              {/* Custom Month Dropdown */}
              <div className="relative" ref={monthDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthOpen((prev) => !prev);
                    setIsYearOpen(false);
                  }}
                  aria-expanded={isMonthOpen}
                  aria-haspopup="listbox"
                  aria-label="Pilih bulan"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-[10px] border text-xs font-bold transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                    isMonthOpen
                      ? 'border-cobalt-500 bg-blue-50/80 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-300 ring-2 ring-cobalt-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="truncate max-w-[85px] sm:max-w-none">{MONTH_NAMES[viewMonth]}</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${isMonthOpen ? 'rotate-180 text-cobalt-500' : 'text-slate-400'}`} />
                </button>

                {isMonthOpen && (
                  <div
                    role="listbox"
                    aria-label="Daftar bulan"
                    className="absolute left-0 mt-1 w-36 max-h-52 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl py-1 z-60 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {MONTH_NAMES.map((name, idx) => {
                      const isSelected = idx === viewMonth;
                      return (
                        <button
                          key={name}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setViewMonth(idx);
                            setIsMonthOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition cursor-pointer focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-300 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Year Dropdown */}
              <div className="relative" ref={yearDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsYearOpen((prev) => !prev);
                    setIsMonthOpen(false);
                  }}
                  aria-expanded={isYearOpen}
                  aria-haspopup="listbox"
                  aria-label="Pilih tahun"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-[10px] border text-xs font-bold transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                    isYearOpen
                      ? 'border-cobalt-500 bg-blue-50/80 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-300 ring-2 ring-cobalt-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{viewYear}</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${isYearOpen ? 'rotate-180 text-cobalt-500' : 'text-slate-400'}`} />
                </button>

                {isYearOpen && (
                  <div
                    ref={yearListRef}
                    role="listbox"
                    aria-label="Daftar tahun"
                    className="absolute right-0 sm:left-0 mt-1 w-28 max-h-52 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl py-1 z-60 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {years.map((y) => {
                      const isSelected = y === viewYear;
                      return (
                        <button
                          key={y}
                          ref={isSelected ? selectedYearButtonRef : undefined}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setViewYear(y);
                            setIsYearOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition cursor-pointer focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/70 text-cobalt-500 dark:text-blue-300 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                          }`}
                        >
                          <span>{y}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cobalt-500 dark:text-blue-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              title="Bulan berikutnya"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          {showPresets && (
            <div className="flex items-center gap-1.5 pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectPreset(0)}
                className="flex-1 py-1.5 px-2 rounded-[10px] text-caption font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(-1)}
                className="flex-1 py-1.5 px-2 rounded-[10px] text-caption font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(-3)}
                className="flex-1 py-1.5 px-2 rounded-[10px] text-caption font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
              >
                3 Hari Lalu
              </button>
            </div>
          )}

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {DAY_NAMES.map((d) => (
              <span
                key={d}
                className="text-caption font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-0.5"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(item.year, item.month, item.day)}
                    className="h-8 min-h-[32px] rounded-[10px] text-caption font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500"
                  >
                    {item.day}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.year, item.month, item.day)}
                  className={`h-8 min-h-[32px] rounded-[10px] text-xs font-semibold flex items-center justify-center transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 ${
                    item.isSelected
                      ? 'bg-cobalt-500 text-white font-bold shadow-md shadow-cobalt-500/30 scale-105'
                      : item.isToday
                      ? 'border border-cobalt-500 text-cobalt-500 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DatePicker = TrackerDatePicker;
export type { TrackerDatePickerProps, TrackerDatePickerProps as DatePickerProps };
