'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X, Briefcase, Plus, Check, Sparkles } from 'lucide-react';
import { useRoleSearchIndex, POPULAR_ENTRY_ROLES } from '@/lib/role-search-index';
import type { DynamicRoleBlueprint } from '@/lib/career-direction-engine';

export const POPULAR_JOB_POSITIONS = POPULAR_ENTRY_ROLES;

interface JobTitleSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
  blueprints?: DynamicRoleBlueprint[];
  placeholder?: string;
}

export const JobTitleSearchSelect: React.FC<JobTitleSearchSelectProps> = ({
  value,
  onChange,
  hasError = false,
  disabled = false,
  id,
  blueprints,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook pencarian 788 master blueprints & 11.000 alias
  const { search } = useRoleSearchIndex(blueprints);

  // Sync searchQuery with external value when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(value || '');
    }
  }, [value, isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery(value || '');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [value]);

  // Hasil pencarian cerdas
  const searchResults = useMemo(() => {
    return search(searchQuery, 15);
  }, [searchQuery, search]);

  // Check if current search query exactly matches any existing position
  const isExactMatch = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return true;
    return searchResults.some((pos) => pos.title.toLowerCase() === trimmed);
  }, [searchQuery, searchResults]);

  // Build the list of options to display
  const options = useMemo(() => {
    const trimmed = searchQuery.trim();
    const list: Array<{
      type: 'existing' | 'custom';
      value: string;
      categoryLabel?: string;
      matchedAlias?: string;
    }> = [];

    // If user has typed something that isn't an exact match, show the "Use / Add custom" option at the top
    if (trimmed && !isExactMatch) {
      list.push({ type: 'custom', value: trimmed });
    }

    searchResults.forEach((pos) => {
      list.push({
        type: 'existing',
        value: pos.title,
        categoryLabel: pos.categoryLabel,
        matchedAlias: pos.matchedAlias,
      });
    });

    return list;
  }, [searchQuery, isExactMatch, searchResults]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchQuery(selectedValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex].value);
      } else if (searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery(value || '');
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Display Box */}
      <div
        className={`relative flex items-center w-full rounded-[10px] border transition-all duration-150 ${
          hasError
            ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
            : isOpen
            ? 'border-cobalt-500 ring-2 ring-cobalt-500/20 bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
      >
        <div className="pl-3.5 pr-2 text-slate-500 dark:text-slate-400 flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="job-title-listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `job-title-option-${highlightedIndex}` : undefined}
          disabled={disabled}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 200);
            }
          }}
          onClick={() => {
            if (!disabled && !isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Cari posisi kerja (misal: kurir, barista, admin shopee)...'}
          className="w-full py-2.5 pr-20 text-base sm:text-xs font-semibold text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-500 placeholder:font-medium"
        />

        {/* Clear and Toggle Buttons dengan Touch Target Ergonomis */}
        <div className="absolute right-1 flex items-center">
          {searchQuery && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-[8px] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1]"
              aria-label="Hapus input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen && inputRef.current) {
                  inputRef.current.focus();
                }
              }
            }}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-[8px] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1738D1]"
            aria-label="Toggle dropdown"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-cobalt-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && !disabled && (
        <div
          id="job-title-listbox"
          role="listbox"
          aria-label="Pilihan Posisi Kerja"
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-80 sm:max-h-96 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl text-xs py-1 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-3.5 py-1.5 text-caption font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400" />
              {searchQuery.trim() ? 'HASIL PENCARIAN POSISI' : 'POSISI TERPOPULER'}
            </span>
            <span className="text-[10px] font-normal text-slate-500">
              {options.length} pilihan
            </span>
          </div>

          <div className="py-1">
            {options.map((opt, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isSelected = value.toLowerCase() === opt.value.toLowerCase();

              if (opt.type === 'custom') {
                return (
                  <button
                    key={`custom-${opt.value}`}
                    id={`job-title-option-${idx}`}
                    role="option"
                    aria-selected={isSelected || isHighlighted}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 min-h-[44px] transition cursor-pointer flex items-center justify-between group ${
                      isHighlighted
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-cobalt-500 dark:text-blue-300 font-bold'
                        : 'bg-blue-50/30 dark:bg-blue-950/20 text-cobalt-500 dark:text-blue-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-[6px] bg-cobalt-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate block">
                          Gunakan &quot;{opt.value}&quot;
                        </span>
                        <span className="text-caption font-medium text-blue-600/80 dark:text-blue-400/80 block">
                          Tambahkan sebagai posisi baru
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-[5px] text-caption font-extrabold uppercase bg-blue-100 dark:bg-blue-900/60 text-cobalt-500 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                      Posisi Baru
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={`existing-${opt.value}-${idx}`}
                  id={`job-title-option-${idx}`}
                  role="option"
                  aria-selected={isSelected || isHighlighted}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3.5 py-2.5 min-h-[44px] transition cursor-pointer flex items-center justify-between group ${
                    isHighlighted
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-cobalt-500 dark:text-blue-300 font-bold'
                      : isSelected
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Briefcase
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isHighlighted || isSelected
                          ? 'text-cobalt-500 dark:text-blue-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 dark:text-slate-500'
                      }`}
                    />
                    <div className="truncate">
                      <span className="truncate block font-semibold">{opt.value}</span>
                      {opt.matchedAlias && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                          Cocok alias: <span className="text-cobalt-500 dark:text-blue-400 font-semibold">{opt.matchedAlias}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {opt.categoryLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {opt.categoryLabel}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-cobalt-500 dark:text-blue-400 shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })}

            {options.length === 0 && (
              <div className="px-3.5 py-3 text-center text-slate-500 text-xs">
                Tidak ada posisi yang cocok.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
