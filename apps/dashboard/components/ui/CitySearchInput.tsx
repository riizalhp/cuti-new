'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, X, ChevronDown, Check, Plus } from 'lucide-react';
import { INDONESIAN_CITIES } from '@/lib/indonesianCities';

interface CitySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CitySearchInput: React.FC<CitySearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Cari Kota / Kabupaten di Indonesia (misal: Semarang, Jakarta, Bandung)...',
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [citiesData, setCitiesData] = useState<string[]>(INDONESIAN_CITIES);
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

  // Fetch updated dataset from GitHub if online
  useEffect(() => {
    let isMounted = true;
    fetch('https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => item.nama || item);
          if (formatted.length > 0) {
            setCitiesData(formatted);
          }
        }
      })
      .catch(() => {
        // Fallback cleanly to INDONESIAN_CITIES
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCities = useMemo(() => {
    if (!query.trim()) return citiesData.slice(0, 50);
    const q = query.toLowerCase().trim();
    return citiesData
      .filter((city) => city.toLowerCase().includes(q))
      .slice(0, 60);
  }, [query, citiesData]);

  // Combined options including custom user typed value if not already exact match
  const displayOptions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return filteredCities;

    const exactExists = filteredCities.some(
      (c) => c.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (!exactExists) {
      return [`Gunakan "${trimmed}"`, ...filteredCities];
    }

    return filteredCities;
  }, [query, filteredCities]);

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
        <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          className="w-full pl-10 pr-9 py-3 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/20 transition shadow-2xs"
        />
        {query ? (
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
          {displayOptions.map((opt, idx) => {
            const isHighlighted = idx === selectedIndex;
            const isCustom = opt.startsWith('Gunakan "');

            return (
              <button
                key={opt}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleSelectOption(opt)}
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
                    <MapPin className={`w-3.5 h-3.5 transition-colors shrink-0 ${isHighlighted ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                  )}
                  <span className="truncate">{opt}</span>
                </span>
                {query.trim() && opt.toLowerCase() === query.toLowerCase().trim() && (
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
