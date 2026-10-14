'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Briefcase, Plus, Check, Sparkles } from 'lucide-react';
import { useRoleSearchIndex, RoleSearchResult } from '@/lib/role-search-index';
import type { DynamicRoleBlueprint } from '@/lib/career-direction-engine';

interface PositionSearchInputProps {
  selectedPositions: string[];
  onAddPosition: (pos: string) => void;
  onRemovePosition: (pos: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  blueprints?: DynamicRoleBlueprint[];
}

export const PositionSearchInput: React.FC<PositionSearchInputProps> = ({
  selectedPositions,
  onAddPosition,
  onRemovePosition,
  placeholder = 'Cari posisi kerja (misal: kurir, barista, admin shopee)...',
  autoFocus = false,
  blueprints,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook pencarian 788 master blueprints & 11.000 alias
  const { search } = useRoleSearchIndex(blueprints);

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

  // Hasil pencarian cerdas berbasis query
  const searchResults = useMemo(() => {
    return search(query, 15);
  }, [query, search]);

  // Display items: custom typed option + search results
  const displayItems = useMemo(() => {
    const trimmed = query.trim();
    const items: Array<{
      type: 'custom' | 'role';
      title: string;
      categoryLabel?: string;
      matchedAlias?: string;
    }> = [];

    // Jika user mengetik sesuatu yang belum sama persis dengan opsi pertama, beri opsi kustom
    const exactExists = searchResults.some(
      (r) => r.title.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (trimmed && !exactExists) {
      items.push({
        type: 'custom',
        title: trimmed,
      });
    }

    for (const r of searchResults) {
      items.push({
        type: 'role',
        title: r.title,
        categoryLabel: r.categoryLabel,
        matchedAlias: r.matchedAlias,
      });
    }

    return items;
  }, [query, searchResults]);

  const handleSelectOption = (title: string) => {
    const trimmed = title.trim();
    if (trimmed) {
      onAddPosition(trimmed);
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
    }
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
      setSelectedIndex((prev) => (prev < displayItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayItems.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < displayItems.length) {
        e.preventDefault();
        handleSelectOption(displayItems[selectedIndex].title);
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
    <div className="space-y-2">
      {/* Selected Positions Badges */}
      {selectedPositions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selectedPositions.map((pos) => (
            <span
              key={pos}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 shadow-2xs"
            >
              <Briefcase size={12} className="text-orange-700 shrink-0 dark:text-orange-400" />
              <span>{pos}</span>
              <button
                type="button"
                onClick={() => onRemovePosition(pos)}
                className="hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer p-0.5 rounded-full"
                aria-label={`Hapus ${pos}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input Container */}
      <div className="relative" ref={containerRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none dark:text-slate-400" />
          <input
            type="text"
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={query}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            className="w-full pl-10 pr-24 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-500/20 transition shadow-2xs"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(true);
                  setSelectedIndex(-1);
                }}
                className="p-1 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer dark:text-slate-400"
                title="Hapus ketikan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (query.trim()) {
                  handleSelectOption(query.trim());
                } else {
                  setIsOpen(!isOpen);
                }
              }}
              className="px-3 py-1.5 bg-cobalt-500 hover:bg-cobalt-600 text-white font-bold text-caption rounded-[10px] transition cursor-pointer shadow-2xs"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Dropdown Menu Popover */}
        {isOpen && displayItems.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] shadow-xl text-xs py-1 divide-y divide-slate-100 dark:divide-slate-800/50">
            {/* Header Keterangan */}
            <div className="px-3 py-1.5 text-caption font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-500" />
                {query.trim() ? 'HASIL PENCARIAN LOWONGAN (788 PERAN MASTER)' : 'POSISI TERPOPULER DI INDONESIA'}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {displayItems.length} pilihan
              </span>
            </div>

            {/* List Pilihan */}
            {displayItems.map((item, idx) => {
              const isHighlighted = idx === selectedIndex;
              const isCustom = item.type === 'custom';
              const isAlreadySelected = selectedPositions.includes(item.title);

              return (
                <button
                  key={`${item.title}-${idx}`}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelectOption(item.title)}
                  className={`w-full text-left px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between group ${
                    isHighlighted
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-cobalt-600 dark:text-blue-300 font-bold'
                      : isCustom
                      ? 'bg-orange-50/60 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {isCustom ? (
                      <Plus className="w-3.5 h-3.5 text-orange-600 shrink-0 dark:text-orange-400" />
                    ) : (
                      <Briefcase
                        className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                          isHighlighted
                            ? 'text-cobalt-600 dark:text-blue-400'
                            : 'text-slate-400 group-hover:text-cobalt-500 dark:text-slate-500'
                        }`}
                      />
                    )}
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs">{item.title}</span>
                        {isCustom && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300">
                            Kustom
                          </span>
                        )}
                      </div>
                      {item.matchedAlias && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          Cocok alias: <span className="text-cobalt-600 dark:text-blue-400 font-semibold">{item.matchedAlias}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.categoryLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {item.categoryLabel}
                      </span>
                    )}
                    {isAlreadySelected ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 dark:text-emerald-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-cobalt-500 shrink-0 dark:text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
