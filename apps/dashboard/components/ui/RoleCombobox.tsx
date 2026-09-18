'use client';

import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Briefcase, ChevronDown, Check, Plus, X, Search } from 'lucide-react';
import {
  ENGINE_ROLES,
  ROLE_ALIASES,
  EngineRoleOption,
} from '@/lib/career-direction-engine';

export interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  onEnterPress?: () => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const RoleCombobox: React.FC<RoleComboboxProps> = ({
  value,
  onChange,
  placeholder = 'Pilih dari daftar peran engine atau ketik posisi baru...',
  hasError = false,
  onEnterPress,
  disabled = false,
  className = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

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

  // Filter roles based on user input (matching title, category label, or alias)
  const filteredRoles = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return ENGINE_ROLES;

    // Set of matching role titles via aliases
    const aliasMatchedTitles = new Set<string>();
    for (const [alias, targetTitle] of Object.entries(ROLE_ALIASES)) {
      if (alias.includes(query) || query.includes(alias)) {
        aliasMatchedTitles.add(targetTitle.toLowerCase());
      }
    }

    return ENGINE_ROLES.filter((r) => {
      const titleLower = r.title.toLowerCase();
      const catLower = r.categoryLabel.toLowerCase();
      return (
        titleLower.includes(query) ||
        catLower.includes(query) ||
        aliasMatchedTitles.has(titleLower)
      );
    });
  }, [value]);

  // Check if current input matches an exact role
  const hasExactMatch = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return true; // Treat empty as not needing "creatable" banner
    return ENGINE_ROLES.some((r) => r.title.toLowerCase() === trimmed);
  }, [value]);

  // Is custom input option visible?
  const showCustomOption = Boolean(value.trim().length > 0 && !hasExactMatch);

  // Group roles by category
  const groupedRoles = useMemo(() => {
    const groups: { categoryLabel: string; roles: EngineRoleOption[] }[] = [];
    const categoryMap = new Map<string, EngineRoleOption[]>();

    for (const role of filteredRoles) {
      const list = categoryMap.get(role.categoryLabel) || [];
      list.push(role);
      categoryMap.set(role.categoryLabel, list);
    }

    for (const [categoryLabel, roles] of categoryMap.entries()) {
      groups.push({ categoryLabel, roles });
    }

    return groups;
  }, [filteredRoles]);

  // Flat list of selectable items for keyboard navigation
  const selectableItems = useMemo(() => {
    const items: { type: 'custom' | 'role'; value: string; role?: EngineRoleOption }[] = [];
    if (showCustomOption) {
      items.push({ type: 'custom', value: value.trim() });
    }
    for (const group of groupedRoles) {
      for (const role of group.roles) {
        items.push({ type: 'role', value: role.title, role });
      }
    }
    return items;
  }, [showCustomOption, value, groupedRoles]);

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
            ? 'border-blue-500 bg-white dark:bg-slate-800 ring-2 ring-blue-500/20 text-slate-900 dark:text-white'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
        }`}
      >
        <div className="pl-3.5 pr-1.5 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0 flex items-center justify-center">
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
          className="w-full py-2.5 pl-1 pr-16 bg-transparent text-xs font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
        />

        {/* Action icons right */}
        <div className="absolute right-2.5 flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-[6px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Hapus pilihan"
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
            className="p-1 rounded-[6px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition cursor-pointer"
            title={isOpen ? 'Tutup daftar' : 'Lihat daftar peran'}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
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
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-[10px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs animate-in fade-in-80 zoom-in-95 duration-150"
        >
          {/* 1. Custom / Typed Option if user input is not an exact match */}
          {showCustomOption && (
            <div className="p-1 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                data-option-index={0}
                onClick={() => handleSelectRole(value.trim())}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-left transition cursor-pointer ${
                  highlightedIndex === 0
                    ? 'bg-blue-500 text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Plus
                    className={`w-3.5 h-3.5 shrink-0 ${
                      highlightedIndex === 0 ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate text-xs font-semibold">{value.trim()}</span>
                </div>
              </button>
            </div>
          )}

          {/* 2. Grouped Roles List from Engine */}
          {filteredRoles.length > 0 ? (
            groupedRoles.map((group) => (
              <div key={group.categoryLabel} className="py-1">
                {/* Category Header */}
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>{group.categoryLabel}</span>
                  <span className="text-[9px] font-bold text-slate-400/80">
                    {group.roles.length} peran
                  </span>
                </div>

                {/* Role Items */}
                {group.roles.map((role) => {
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
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-[#1738D1] dark:text-blue-400 font-bold'
                          : isHighlighted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
                      }`}
                    >
                      <div className="flex items-center min-w-0 pr-2">
                        <span className="truncate text-xs">{role.title}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#1738D1] dark:text-blue-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            !showCustomOption && (
              <div className="py-6 px-4 text-center">
                <Search className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Posisi tidak ditemukan
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
