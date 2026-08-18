'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronDown, Check, Plus, Briefcase } from 'lucide-react';

export const POPULAR_POSITIONS = [
  'Admin Staff',
  'Customer Service',
  'Staff Operasional',
  'UI/UX Designer',
  'Graphic Designer',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Digital Marketer',
  'Social Media Specialist',
  'Content Writer',
  'Sales Representative',
  'Accountant / Staff Akuntansi',
  'Human Resources (HR) Staff',
  'Data Analyst',
  'Quality Assurance (QA)',
  'Barista / Service Staff',
  'Kasir & Store Associate',
  'Teknisi Komputer & Jaringan',
  'Desainer Grafis & Video Editor',
];

interface PositionSearchInputProps {
  selectedPositions: string[];
  onAddPosition: (pos: string) => void;
  onRemovePosition: (pos: string) => void;
  placeholder?: string;
}

export const PositionSearchInput: React.FC<PositionSearchInputProps> = ({
  selectedPositions,
  onAddPosition,
  onRemovePosition,
  placeholder = 'Cari atau ketik posisi target...',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredPositions = useMemo(() => {
    if (!query.trim()) return POPULAR_POSITIONS;
    const q = query.toLowerCase().trim();
    return POPULAR_POSITIONS.filter((pos) => pos.toLowerCase().includes(q));
  }, [query]);

  // Display options including custom user typed value if not exact match
  const displayOptions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return filteredPositions;

    const exactExists = filteredPositions.some(
      (pos) => pos.toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (!exactExists) {
      return [`Gunakan "${trimmed}"`, ...filteredPositions];
    }

    return filteredPositions;
  }, [query, filteredPositions]);

  const handleSelectOption = (rawOption: string) => {
    let finalValue = rawOption;
    if (rawOption.startsWith('Gunakan "') && rawOption.endsWith('"')) {
      finalValue = rawOption.slice(9, -1);
    }
    const trimmed = finalValue.trim();
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
    <div className="space-y-2">
      {/* Selected Positions Badges */}
      {selectedPositions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selectedPositions.map((pos) => (
            <span
              key={pos}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 shadow-2xs"
            >
              <Briefcase size={12} className="text-orange-500 shrink-0" />
              <span>{pos}</span>
              <button
                type="button"
                onClick={() => onRemovePosition(pos)}
                className="hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
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
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            className="w-full pl-10 pr-24 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/20 transition shadow-2xs"
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
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer"
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
              className="px-3 py-1 bg-[#1738D1] hover:bg-[#132EA8] text-white font-bold text-[11px] rounded-[10px] transition cursor-pointer shadow-2xs"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Aligned Dropdown Popover */}
        {isOpen && displayOptions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] shadow-xl text-xs py-1 divide-y divide-slate-100 dark:divide-slate-800/50">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span>POSISI TERPOPULER</span>
            </div>
            {displayOptions.map((pos, idx) => {
              const isHighlighted = idx === selectedIndex;
              const isCustom = pos.startsWith('Gunakan "');
              const isAlreadySelected = selectedPositions.includes(
                isCustom ? pos.slice(9, -1) : pos
              );

              return (
                <button
                  key={pos}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelectOption(pos)}
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
                      <Briefcase
                        className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                          isHighlighted
                            ? 'text-orange-500'
                            : 'text-slate-400 group-hover:text-orange-500'
                        }`}
                      />
                    )}
                    <span className="truncate">{pos}</span>
                  </span>
                  {isAlreadySelected ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
