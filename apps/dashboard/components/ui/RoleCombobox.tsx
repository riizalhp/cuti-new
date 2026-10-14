'use client';

import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Briefcase, ChevronDown, Check, Plus, X, Search, Sparkles } from 'lucide-react';
import { useRoleSearchIndex } from '@/lib/role-search-index';
import type { DynamicRoleBlueprint } from '@/lib/career-direction-engine';

export interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  onEnterPress?: () => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  blueprints?: DynamicRoleBlueprint[];
}

export const RoleCombobox: React.FC<RoleComboboxProps> = ({
  value,
  onChange,
  placeholder = 'Pilih posisi kerja atau ketik (misal: kurir, barista, admin)...',
  hasError = false,
  onEnterPress,
  disabled = false,
  className = '',
  autoFocus = false,
  blueprints,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Hook pencarian 788 master blueprints & 11.000 alias
  const { search } = useRoleSearchIndex(blueprints);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter roles based on user input
  const searchResults = useMemo(() => {
    return search(value, 15);
  }, [value, search]);

  // Check if current input matches an exact role
  const hasExactMatch = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return true;
    return searchResults.some((r) => r.title.toLowerCase() === trimmed);
  }, [value, searchResults]);

  // Is custom input option visible?
  const showCustomOption = Boolean(value.trim().length > 0 && !hasExactMatch);

  // Selectable items flat list for keyboard navigation
  const selectableItems = useMemo(() => {
    const items: Array<{
      type: 'custom' | 'role';
      value: string;
      categoryLabel?: string;
      matchedAlias?: string;
    }> = [];

    if (showCustomOption) {
      items.push({ type: 'custom', value: value.trim() });
    }

    searchResults.forEach((r) => {
      items.push({
        type: 'role',
        value: r.title,
        categoryLabel: r.categoryLabel,
        matchedAlias: r.matchedAlias,
      });
    });

    return items;
  }, [showCustomOption, value, searchResults]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.querySelector(
        `[data-option-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelectRole = (roleTitle: string) => {
    onChange(roleTitle);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(selectableItems.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : selectableItems.length - 1
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < selectableItems.length) {
        e.preventDefault();
        handleSelectRole(selectableItems[highlightedIndex].value);
        return;
      }
      if (isOpen) {
        setIsOpen(false);
      }
      if (onEnterPress) {
        e.preventDefault();
        onEnterPress();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input container */}
      <div
        className={`relative w-full flex items-center rounded-[10px] border transition ${
          hasError
            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 focus-within:ring-2 focus-within:ring-rose-500'
            : isOpen
            ? 'border-cobalt-500 bg-white dark:bg-slate-800 ring-2 ring-cobalt-500/20 text-slate-900 dark:text-white'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-500/20'
        }`}
      >
        <div className="pl-3.5 pr-1.5 text-slate-500 dark:text-slate-400 pointer-events-none shrink-0 flex items-center justify-center">
          <Briefcase className="w-3.5 h-3.5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          className="w-full py-2.5 pl-1 pr-16 bg-transparent text-xs font-semibold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
        />

        {/* Action icons right */}
        <div className="absolute right-2.5 flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="h-7 w-7 flex items-center justify-center rounded-[6px] text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Hapus pilihan"
              aria-label="Hapus pilihan peran"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen && inputRef.current) {
                  inputRef.current.focus();
                }
              }
            }}
            className="h-7 w-7 flex items-center justify-center rounded-[6px] text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition cursor-pointer"
            title={isOpen ? 'Tutup daftar' : 'Lihat daftar peran'}
            aria-label={isOpen ? 'Tutup daftar peran' : 'Lihat daftar peran'}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-cobalt-500 dark:text-blue-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs animate-in fade-in-80 zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="px-3.5 py-1.5 text-caption font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-orange-500" />
              {value.trim() ? 'HASIL PENCARIAN 788+ PERAN' : 'POSISI TERPOPULER DI INDONESIA'}
            </span>
            <span className="text-[10px] font-normal text-slate-500">
              {selectableItems.length} pilihan
            </span>
          </div>

          {/* 1. Custom / Typed Option */}
          {showCustomOption && (
            <div className="p-1 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                data-option-index={0}
                onClick={() => handleSelectRole(value.trim())}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-left transition cursor-pointer ${
                  highlightedIndex === 0
                    ? 'bg-cobalt-500 text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Plus
                    className={`w-3.5 h-3.5 shrink-0 ${
                      highlightedIndex === 0 ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                  <span className="truncate text-xs font-semibold">Gunakan &quot;{value.trim()}&quot;</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300">
                  Posisi Baru
                </span>
              </button>
            </div>
          )}

          {/* 2. Search Results List */}
          {searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((role) => {
                const roleIndex = selectableItems.findIndex(
                  (item) => item.type === 'role' && item.value === role.title
                );
                const isSelected =
                  value.trim().toLowerCase() === role.title.toLowerCase();
                const isHighlighted = highlightedIndex === roleIndex;

                return (
                  <button
                    key={role.title}
                    type="button"
                    data-option-index={roleIndex}
                    onClick={() => handleSelectRole(role.title)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-cobalt-600 dark:text-blue-300 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Briefcase
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected || isHighlighted
                            ? 'text-cobalt-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <div className="truncate">
                        <span className="truncate text-xs block font-semibold">{role.title}</span>
                        {role.matchedAlias && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                            Cocok alias: <span className="text-cobalt-600 dark:text-blue-400 font-semibold">{role.matchedAlias}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {role.categoryLabel && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {role.categoryLabel}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-cobalt-600 dark:text-blue-400 shrink-0 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            !showCustomOption && (
              <div className="py-6 px-4 text-center">
                <Search className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Posisi tidak ditemukan
                </p>
                <p className="text-caption text-slate-500 dark:text-slate-400 mt-0.5">
                  Ketik posisi yang kamu tuju untuk memilihnya.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
