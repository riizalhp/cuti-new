'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, X, ChevronDown, Check, Loader2, Plus } from 'lucide-react';
import {
  INDONESIAN_UNIVERSITIES,
  INDONESIAN_SMA,
  INDONESIAN_SMK,
  INDONESIAN_ALL_SCHOOLS,
} from '@/lib/indonesianSchools';

interface SchoolSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  educationLevel?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SchoolSearchInput: React.FC<SchoolSearchInputProps> = ({
  value,
  onChange,
  educationLevel = '',
  placeholder,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [pddiktiPtResults, setPddiktiPtResults] = useState<string[]>([]);
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

  // Base local list per education level
  const baseLocalSchools = useMemo(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return INDONESIAN_SMA;
    if (lvl === 'SMK') return INDONESIAN_SMK;
    if (lvl === 'D3' || lvl === 'D4' || lvl === 'S1' || lvl === 'S2')
      return INDONESIAN_UNIVERSITIES;
    return INDONESIAN_ALL_SCHOOLS;
  }, [educationLevel]);

  // Dynamic placeholder text
  const dynamicPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return 'Cari nama SMA...';
    if (lvl === 'SMK') return 'Cari nama SMK...';
    if (lvl === 'D3' || lvl === 'D4' || lvl === 'S1' || lvl === 'S2')
      return 'Cari Kampus / Perguruan Tinggi PDDikti...';
    return 'Cari Nama Sekolah / Kampus...';
  }, [placeholder, educationLevel]);

  // Debounced PDDikti Perguruan Tinggi API search
  useEffect(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA' || lvl === 'SMK') {
      setPddiktiPtResults([]);
      setIsLoadingApi(false);
      return;
    }

    const q = query.trim();
    if (!q || q.length < 2) {
      setPddiktiPtResults([]);
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
          const ptList: string[] = [];

          if (resData.data && Array.isArray(resData.data.pt)) {
            resData.data.pt.forEach((item: any) => {
              const name = item.nama_pt || item.pt || item.nama || item.text;
              const singkatan = item.singkatan || '';
              if (name && typeof name === 'string') {
                const fullName = singkatan ? `${name} (${singkatan})` : name;
                if (!ptList.includes(fullName)) {
                  ptList.push(fullName);
                }
              }
            });
          }

          setPddiktiPtResults(ptList);
        })
        .catch(() => {
          setPddiktiPtResults([]);
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

    pddiktiPtResults.forEach((item) => set.add(item));

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      baseLocalSchools.filter((s) => s.toLowerCase().includes(q)).forEach((s) =>
        set.add(s)
      );
    } else {
      baseLocalSchools.forEach((s) => set.add(s));
    }

    return Array.from(set).slice(0, 50);
  }, [query, pddiktiPtResults, baseLocalSchools]);

  // Display options including custom user typed value if not exact match
  const displayOptions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return combinedSuggestions;

    const exactExists = combinedSuggestions.some(
      (s) => s.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (!exactExists) {
      return [`Gunakan "${trimmed}"`, ...combinedSuggestions];
    }

    return combinedSuggestions;
  }, [query, combinedSuggestions]);

  // Badge label text
  const badgeLabel = useMemo(() => {
    const lvl = (educationLevel || '').toUpperCase().trim();
    if (lvl === 'SMA') return 'DATA SEKOLAH SMA';
    if (lvl === 'SMK') return 'DATA SEKOLAH SMK';
    if (lvl === 'D3' || lvl === 'D4' || lvl === 'S1' || lvl === 'S2')
      return 'KAMPUS PDDikti KEMDIKTISAINTEK';
    return 'SEKOLAH & PERGURUAN TINGGI';
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
        <Building2 className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
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
            {pddiktiPtResults.length > 0 && (
              <span className="text-orange-500 font-extrabold">{pddiktiPtResults.length} Hasil API</span>
            )}
          </div>
          {displayOptions.map((school, idx) => {
            const isHighlighted = idx === selectedIndex;
            const isCustom = school.startsWith('Gunakan "');

            return (
              <button
                key={school}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSelectOption(school)}
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
                    <Building2 className={`w-3.5 h-3.5 transition-colors shrink-0 ${isHighlighted ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                  )}
                  <span className="truncate">{school}</span>
                </span>
                {query.trim() && school.toLowerCase() === query.toLowerCase().trim() && (
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
