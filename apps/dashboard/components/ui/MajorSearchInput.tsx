'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraduationCap, X, ChevronDown, Check, Loader2, Plus } from 'lucide-react';
import {
  SMA_MAJORS,
  SMK_MAJORS,
  DIPLOMA_MAJORS,
  COLLEGE_MAJORS,
  INDONESIAN_MAJORS,
} from '@/lib/indonesianMajors';

interface MajorSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  educationLevel?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const MajorSearchInput: React.FC<MajorSearchInputProps> = ({
  value,
  onChange,
  educationLevel = '',
  placeholder,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [pddiktiResults, setPddiktiResults] = useState<string[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine base local dataset based on education level
  const baseLocalMajors = useMemo(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return SMA_MAJORS;
    if (lvl === 'SMK') return SMK_MAJORS;
    if (lvl === 'D3' || lvl === 'D4') return DIPLOMA_MAJORS;
    if (lvl === 'S1' || lvl === 'S2') return COLLEGE_MAJORS;
    return INDONESIAN_MAJORS;
  }, [educationLevel]);

  // Dynamic placeholder text
  const dynamicPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return 'Pilih / cari jurusan SMA...';
    if (lvl === 'SMK') return 'Pilih / cari jurusan SMK...';
    if (lvl === 'D3' || lvl === 'D4') return 'Cari prodi Diploma D3/D4 PDDikti...';
    if (lvl === 'S1' || lvl === 'S2') return 'Cari prodi Sarjana PDDikti...';
    return 'Cari Jurusan / Program Studi...';
  }, [placeholder, educationLevel]);

  // Debounced PDDikti API search
  useEffect(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA' || lvl === 'SMK') {
      setPddiktiResults([]);
      setIsLoadingApi(false);
      return;
    }

    const q = query.trim();
    if (!q || q.length < 2) {
      setPddiktiResults([]);
      setIsLoadingApi(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingApi(true);

    const timer = setTimeout(() => {
      fetch(`https://pddikti.rone.dev/api/search/all/${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((resData) => {
          if (isCancelled || !resData) return;
          const prodiList: string[] = [];

          if (resData.data && Array.isArray(resData.data.prodi)) {
            resData.data.prodi.forEach((item: any) => {
              const name = item.nama_prodi || item.prodi || item.nama || item.text;
              const pt = item.nama_pt || item.pt || '';
              if (name && typeof name === 'string') {
                const fullName = pt ? `${name} (${pt})` : name;
                if (!prodiList.includes(fullName)) {
                  prodiList.push(fullName);
                }
              }
            });
          }

          setPddiktiResults(prodiList);
        })
        .catch(() => {
          setPddiktiResults([]);
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingApi(false);
          }
        });
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, educationLevel]);

  // Combined suggestions
  const combinedSuggestions = useMemo(() => {
    const set = new Set<string>();

    pddiktiResults.forEach((item) => set.add(item));

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      baseLocalMajors.filter((m) => m.toLowerCase().includes(q)).forEach((m) =>
        set.add(m)
      );
    } else {
      baseLocalMajors.forEach((m) => set.add(m));
    }

    return Array.from(set).slice(0, 50);
  }, [query, pddiktiResults, baseLocalMajors]);

  // Display options including custom user typed value if not exact match
  const displayOptions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return combinedSuggestions;

    const exactExists = combinedSuggestions.some(
      (m) => m.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (!exactExists) {
      return [`Gunakan "${trimmed}"`, ...combinedSuggestions];
    }

    return combinedSuggestions;
  }, [query, combinedSuggestions]);

  // Badge label text
  const badgeLabel = useMemo(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return 'JURUSAN SMA';
    if (lvl === 'SMK') return 'JURUSAN KEAHLIAN SMK';
    if (lvl === 'D3' || lvl === 'D4') return 'DIPLOMA & PDDikti';
    if (lvl === 'S1' || lvl === 'S2') return 'SARJANA & PDDikti';
    return 'PDDikti KEMDIKTISAINTEK';
  }, [educationLevel]);

  const handleSelectOption = (rawOption: string) => {
    let finalValue = rawOption;
    if (rawOption.startsWith('Gunakan "') && rawOption.endsWith('"')) {
      finalValue = rawOption.slice(9, -1);
    }
    setQuery(finalValue);
    onChange(finalValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayOptions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < displayOptions.length) {
        e.preventDefault();
        handleSelectOption(displayOptions[selectedIndex]);
      } else if (query.trim()) {
        e.preventDefault();
        handleSelectOption(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <GraduationCap className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          autoFocus={autoFocus}
          placeholder={dynamicPlaceholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          className="w-full pl-10 pr-9 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/20 transition shadow-2xs"
        />

        {isLoadingApi ? (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-orange-500 animate-spin pointer-events-none" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && displayOptions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] shadow-xl text-xs py-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <span>DAFTAR {badgeLabel}</span>
            {pddiktiResults.length > 0 && (
              <span className="text-orange-500 font-extrabold">{pddiktiResults.length} Hasil API</span>
            )}
          </div>
          {displayOptions.map((major, idx) => {
            const isHighlighted = idx === selectedIndex;
            const isCustom = major.startsWith('Gunakan "');

            return (
              <button
                key={major}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSelectOption(major)}
                className={`w-full text-left px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between group ${
                  isHighlighted
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                    : isCustom
                    ? 'bg-orange-50/60 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 font-medium'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {isCustom ? (
                    <Plus className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  ) : (
                    <GraduationCap className={`w-3.5 h-3.5 transition-colors shrink-0 ${isHighlighted ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                  )}
                  <span className="truncate">{major}</span>
                </span>
                {query.trim() && major.toLowerCase() === query.toLowerCase().trim() && (
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
