'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Globe, X, ChevronDown, Check, Plus, ExternalLink } from 'lucide-react';

export interface PortalItem {
  name: string;
  domain?: string;
  defaultUrl?: string;
  badge?: string;
}

export const KNOWN_JOB_PORTALS: PortalItem[] = [
  // Top 10 Major Platforms
  { name: 'LinkedIn', domain: 'linkedin.com', defaultUrl: 'https://www.linkedin.com/jobs', badge: 'Populer' },
  { name: 'JobStreet', domain: 'jobstreet.co.id', defaultUrl: 'https://www.jobstreet.co.id', badge: 'Populer' },
  { name: 'Glints', domain: 'glints.com', defaultUrl: 'https://glints.com', badge: 'Populer' },
  { name: 'Dealls', domain: 'dealls.com', defaultUrl: 'https://dealls.com/jobs', badge: 'Populer' },
  { name: 'KitaLulus', domain: 'kitalulus.com', defaultUrl: 'https://www.kitalulus.com', badge: 'Populer' },
  { name: 'Kalibrr', domain: 'kalibrr.com', defaultUrl: 'https://www.kalibrr.com', badge: 'Populer' },
  { name: 'Disnakerja.com', domain: 'disnakerja.com', defaultUrl: 'https://www.disnakerja.com', badge: 'BUMN/Swasta' },
  { name: 'Karir.com', domain: 'karir.com', defaultUrl: 'https://www.karir.com', badge: 'Populer' },
  { name: 'Indeed', domain: 'indeed.com', defaultUrl: 'https://id.indeed.com', badge: 'Global' },
  { name: 'Tech in Asia', domain: 'techinasia.com', defaultUrl: 'https://www.techinasia.com/jobs', badge: 'Tech' },

  // Sumber Scraping & Portal Karir Indonesia Lainnya
  { name: 'Cake (CakeResume)', domain: 'cake.me', defaultUrl: 'https://www.cake.me' },
  { name: 'Talent.com', domain: 'talent.com', defaultUrl: 'https://id.talent.com/jobs' },
  { name: 'Jobindo', domain: 'jobindo.com', defaultUrl: 'https://jobindo.com/cari-lowongan-kerja' },
  { name: 'Jora', domain: 'jora.com', defaultUrl: 'https://id.jora.com/jobs' },
  { name: 'Lokernas', domain: 'lokernas.com', defaultUrl: 'https://www.lokernas.com' },
  { name: 'Jobinaja', domain: 'jobinaja.com', defaultUrl: 'https://www.jobinaja.com' },
  { name: 'OfficialKarir', domain: 'officialkarir.com', defaultUrl: 'https://www.officialkarir.com' },
  { name: 'LogKerja', domain: 'logkerja.id', defaultUrl: 'https://www.logkerja.id' },
  { name: 'Loker.id', domain: 'loker.id', defaultUrl: 'https://loker.id' },
  { name: 'Jooble', domain: 'jooble.org', defaultUrl: 'https://id.jooble.org' },
  { name: 'LamarLangsung', domain: 'lamarlangsung.com', defaultUrl: 'https://lamarlangsung.com' },
  { name: 'InfoLokerKerja', domain: 'informasilowongankerja.com', defaultUrl: 'https://informasilowongankerja.com' },
  { name: 'SolusiKerja', domain: 'solusikerja.net', defaultUrl: 'https://solusikerja.net' },
  { name: 'BursaKerjaDepnaker', domain: 'bursakerjadepnaker.com', defaultUrl: 'https://bursakerjadepnaker.com' },
  { name: 'Loker HeadOffice', domain: 'lokerho.com', defaultUrl: 'https://lokerho.com' },
  { name: 'SejakKemarin', domain: 'sejakkemarin.com', defaultUrl: 'https://sejakkemarin.com' },
  { name: 'Loker Anak Medan', domain: 'lokeranakmedan.com', defaultUrl: 'https://lokeranakmedan.com' },
  { name: 'Info Loker Jabar', domain: 'infolokerjabar.com', defaultUrl: 'https://infolokerjabar.com' },
  { name: 'Info Loker Banten', domain: 'infolokerbanten.com', defaultUrl: 'https://infolokerbanten.com' },
  { name: 'Info Loker Karawang', domain: 'infolokerkarawang.com', defaultUrl: 'https://infolokerkarawang.com' },
  { name: 'LokerMuslim', domain: 'lokermuslim.id', defaultUrl: 'https://www.lokermuslim.id' },
  { name: 'Lowker Jogja', domain: 'lowkerjogja.co.id', defaultUrl: 'https://lowkerjogja.co.id' },
  { name: 'Urbanhire', domain: 'urbanhire.com', defaultUrl: 'https://www.urbanhire.com' },
  { name: 'TopKarir', domain: 'topkarir.com', defaultUrl: 'https://www.topkarir.com' },
  { name: 'Deel', domain: 'deel.com', defaultUrl: 'https://www.deel.com' },

  // Direct & Referral Channels
  { name: 'Website Perusahaan (Karier)', badge: 'Direct' },
  { name: 'Email Recruiter / HRD', badge: 'Direct' },
  { name: 'Referensi Karyawan Internal', badge: 'Referral' },
];

interface PortalSearchDropdownProps {
  value: string;
  onChange: (portalName: string, suggestedUrl?: string) => void;
  placeholder?: string;
  className?: string;
}

export const PortalSearchDropdown: React.FC<PortalSearchDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Pilih atau ketik nama portal loker...',
  className = '',
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

  const filteredPortals = useMemo(() => {
    if (!query.trim()) return KNOWN_JOB_PORTALS;
    const q = query.toLowerCase().trim();
    return KNOWN_JOB_PORTALS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.domain && p.domain.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
  }, [query]);

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filteredPortals.some((p) => p.name.toLowerCase() === q);
  }, [query, filteredPortals]);

  const handleSelectPortal = (portal: PortalItem) => {
    setQuery(portal.name);
    onChange(portal.name, portal.defaultUrl);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSelectCustom = (customName: string) => {
    const trimmed = customName.trim();
    setQuery(trimmed);
    onChange(trimmed);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    const totalCount = filteredPortals.length + (!hasExactMatch && query.trim() ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const showCustom = !hasExactMatch && query.trim();
      if (showCustom && selectedIndex === 0) {
        handleSelectCustom(query);
      } else {
        const itemIdx = showCustom ? selectedIndex - 1 : selectedIndex;
        if (itemIdx >= 0 && itemIdx < filteredPortals.length) {
          handleSelectPortal(filteredPortals[itemIdx]);
        } else if (query.trim()) {
          handleSelectCustom(query);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const showCustomOption = !hasExactMatch && query.trim().length > 0;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <Globe className="absolute left-3 w-3.5 h-3.5 text-orange-500 pointer-events-none" />
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
          className="w-full pl-8 pr-8 py-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#1738D1] focus:ring-2 focus:ring-[#1738D1]/20 transition"
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
            className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px] shadow-xl text-xs py-1 divide-y divide-slate-100 dark:divide-slate-800/50 animate-in fade-in zoom-in-95 duration-150">
          {/* Custom user typed option if not exact match */}
          {showCustomOption && (
            <button
              type="button"
              onMouseEnter={() => setSelectedIndex(0)}
              onClick={() => handleSelectCustom(query)}
              className={`w-full text-left px-3.5 py-2.5 transition cursor-pointer flex items-center justify-between ${
                selectedIndex === 0
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                  : 'bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-50 dark:hover:bg-orange-950/30'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Plus className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">Gunakan &quot;{query.trim()}&quot;</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-medium">
                Kustom
              </span>
            </button>
          )}

          {/* List of portal options */}
          {filteredPortals.map((portal, idx) => {
            const currentIdx = showCustomOption ? idx + 1 : idx;
            const isHighlighted = currentIdx === selectedIndex;
            const isSelected = portal.name.toLowerCase() === (value || '').toLowerCase().trim();

            return (
              <button
                key={portal.name}
                type="button"
                onMouseEnter={() => setSelectedIndex(currentIdx)}
                onClick={() => handleSelectPortal(portal)}
                className={`w-full text-left px-3.5 py-2 transition cursor-pointer flex items-center justify-between group ${
                  isHighlighted
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold'
                    : isSelected
                    ? 'bg-slate-100/80 dark:bg-slate-800/80 text-[#1738D1] dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isHighlighted
                        ? 'text-orange-500'
                        : isSelected
                        ? 'text-[#1738D1] dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-orange-500'
                    }`}
                  />
                  <span className="truncate">{portal.name}</span>
                  {portal.domain && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      ({portal.domain})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {portal.badge && (
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {portal.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                </div>
              </button>
            );
          })}

          {filteredPortals.length === 0 && !showCustomOption && (
            <div className="p-4 text-center text-slate-400 text-xs">
              Tidak ada portal yang cocok
            </div>
          )}
        </div>
      )}
    </div>
  );
};
