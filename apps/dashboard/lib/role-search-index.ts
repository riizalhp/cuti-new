'use client';

import { useState, useEffect, useMemo } from 'react';
import type { DynamicRoleBlueprint } from '@/lib/career-direction-engine';

export interface RoleSearchResult {
  title: string;
  category?: string;
  categoryLabel?: string;
  matchedAlias?: string;
}

export const POPULAR_ENTRY_ROLES: string[] = [
  'Admin Online Shop & E-Commerce',
  'Admin Gudang & Logistik',
  'Admin Kantor & Operasional',
  'Customer Service',
  'Kasir & Pramuniaga Retail',
  'Barista / Service Staff',
  'Kurir Motor / Delivery',
  'Staf / Operator Gudang',
  'Operator Produksi Pabrik',
  'Host Live Streaming E-Commerce',
  'Sales Representative / Canvasser',
  'Social Media Content Creator',
  'Graphic Designer',
  'Staff Keuangan & Kasir',
  'Staff HR & Rekrutmen',
  'Teknisi Komputer & Jaringan',
  'Perawat Klinis / Ners',
  'Staf Administrasi Medis',
  'Frontend Developer',
  'Fullstack Developer',
  'Data Analyst',
  'Quality Assurance (QA)',
];

const CATEGORY_LABELS: Record<string, string> = {
  operations: 'Operasional & Admin',
  'hospitality-retail': 'Retail, F&B & Toko',
  'sales-marketing': 'Penjualan & Pemasaran',
  logistics: 'Logistik & Kurir',
  manufacturing: 'Pabrik & Manufaktur',
  creative: 'Kreatif & Media',
  finance: 'Keuangan & Akuntansi',
  tech: 'Teknologi & IT',
  healthcare: 'Kesehatan & Medis',
  education: 'Pendidikan',
  other: 'Lainnya',
};

// Global in-memory client cache so fetch is only executed once across the entire session
let cachedBlueprints: DynamicRoleBlueprint[] | null = null;
let fetchPromise: Promise<DynamicRoleBlueprint[]> | null = null;

export async function fetchRoleBlueprintsOnce(): Promise<DynamicRoleBlueprint[]> {
  if (cachedBlueprints) return cachedBlueprints;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/career/blueprints')
    .then((res) => res.json())
    .then((json) => {
      if (json.success && Array.isArray(json.data)) {
        cachedBlueprints = json.data;
        return json.data;
      }
      return [];
    })
    .catch((err) => {
      console.warn('[fetchRoleBlueprintsOnce] Gagal memuat blueprints:', err);
      return [];
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Filter roles against query across 788 Master Roles + 11.000 Aliases
 */
export function filterRolesWithAliases(
  query: string,
  blueprints: DynamicRoleBlueprint[],
  maxResults = 15
): RoleSearchResult[] {
  const trimmed = query.trim().toLowerCase();

  // 1. Jika query kosong: kembalikan kurasi peran terpopuler Indonesia
  if (!trimmed) {
    return POPULAR_ENTRY_ROLES.map((title) => {
      const matchBp = blueprints.find((b) => b.role_name.toLowerCase() === title.toLowerCase());
      const cat = matchBp?.category || 'operations';
      return {
        title,
        category: cat,
        categoryLabel: CATEGORY_LABELS[cat] || 'Umum',
      };
    });
  }

  // 2. Jika ada query: cari di canonical role name + market aliases
  interface ScoredMatch {
    result: RoleSearchResult;
    score: number;
  }

  const matches: ScoredMatch[] = [];
  const seenTitles = new Set<string>();

  // Prioritaskan peran dari database master
  const sourcePool = blueprints.length > 0
    ? blueprints
    : POPULAR_ENTRY_ROLES.map((r) => ({ role_name: r, category: 'other', top_essential_skills: [], top_nicetohave_skills: [] }));

  for (const bp of sourcePool) {
    const title = bp.role_name;
    const titleLower = title.toLowerCase();
    const cat = bp.category || 'other';
    const catLabel = CATEGORY_LABELS[cat] || 'Lainnya';

    let score = -1;
    let matchedAlias: string | undefined = undefined;

    // A. Cek kecocokan pada canonical title
    if (titleLower === trimmed) {
      score = 100;
    } else if (titleLower.startsWith(trimmed)) {
      score = 80;
    } else if (titleLower.includes(trimmed)) {
      score = 60;
    }

    // B. Cek kecocokan pada aliases & slang
    const aliases = ('details' in bp && bp.details?.market_aliases_and_slang) ? bp.details.market_aliases_and_slang : [];
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase().trim();
      if (!aliasLower) continue;

      if (aliasLower === trimmed) {
        if (score < 90) {
          score = 90;
          matchedAlias = alias;
        }
      } else if (aliasLower.startsWith(trimmed)) {
        if (score < 70) {
          score = 70;
          matchedAlias = alias;
        }
      } else if (aliasLower.includes(trimmed)) {
        if (score < 50) {
          score = 50;
          matchedAlias = alias;
        }
      }
    }

    // C. Cek kategori jika query mencocokkan kategori
    if (score === -1 && catLabel.toLowerCase().includes(trimmed)) {
      score = 30;
    }

    if (score > 0 && !seenTitles.has(titleLower)) {
      seenTitles.add(titleLower);

      // Kurangi skor sedikit untuk posisi senior/manajerial agar entry-level naik ke atas
      if (/manager|manajer|direktur|head of|chief|supervisor/i.test(titleLower)) {
        score -= 25;
      }

      matches.push({
        result: {
          title,
          category: cat,
          categoryLabel: catLabel,
          matchedAlias,
        },
        score,
      });
    }
  }

  // Urutkan skor tertinggi ke terendah dan batasi hasil
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, maxResults).map((m) => m.result);
}

/**
 * Hook untuk menggunakan pencarian peran cerdas di komponen UI apa pun
 */
export function useRoleSearchIndex(initialBlueprints?: DynamicRoleBlueprint[]) {
  const [blueprints, setBlueprints] = useState<DynamicRoleBlueprint[]>(
    initialBlueprints && initialBlueprints.length > 0 ? initialBlueprints : (cachedBlueprints || [])
  );

  useEffect(() => {
    if (initialBlueprints && initialBlueprints.length > 0) {
      setBlueprints(initialBlueprints);
      cachedBlueprints = initialBlueprints;
      return;
    }

    if (!cachedBlueprints) {
      fetchRoleBlueprintsOnce().then((data) => {
        if (data.length > 0) {
          setBlueprints(data);
        }
      });
    }
  }, [initialBlueprints]);

  return {
    blueprints,
    search: (query: string, maxResults = 15) => filterRolesWithAliases(query, blueprints, maxResults),
  };
}
