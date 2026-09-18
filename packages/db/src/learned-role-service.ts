import { prisma } from './index.ts';
import crypto from 'crypto';

export interface LearnedBlueprintRecord {
  id: string;
  role_name: string;
  entry_count: number;
  top_essential_skills: string[];
  top_nicetohave_skills: string[];
  category: string;
  is_promoted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LearnedRoleEntryInput {
  role_name: string;
  skills: string[];
  education_level?: string | null;
  major?: string | null;
  user_id?: string | null;
}

export const learnedRoleService = {
  /**
   * Catat satu entri role & skill dari kandidat
   */
  async recordEntry(input: LearnedRoleEntryInput) {
    const rawRole = (input.role_name || '').trim();
    if (!rawRole) return null;

    const id = crypto.randomUUID();
    const skills = Array.isArray(input.skills)
      ? input.skills.map((s) => String(s).trim()).filter(Boolean)
      : [];

    try {
      await prisma.$executeRaw`
        INSERT INTO learned_role_entries (id, role_name, skills, education_level, major, user_id, created_at)
        VALUES (
          ${id}::uuid,
          ${rawRole},
          ${skills}::text[],
          ${input.education_level || null},
          ${input.major || null},
          ${input.user_id ? input.user_id : null}::uuid,
          NOW()
        )
      `;

      // Jalankan agregasi incremental di background
      this.aggregateRole(rawRole).catch((err: unknown) => {
        console.error('[LearnedRoleService] aggregateRole error:', err);
      });

      return { id, role_name: rawRole };
    } catch (error) {
      console.error('[LearnedRoleService] recordEntry error:', error);
      return null;
    }
  },

  /**
   * Agregasi frekuensi skill dari semua entri role tersebut
   */
  async aggregateRole(roleName: string) {
    const normalized = roleName.trim();
    if (!normalized) return;

    try {
      // Ambil semua entri untuk role ini (case-insensitive)
      const rows = await prisma.$queryRaw<Array<{ skills: string[]; education_level: string | null; major: string | null }>>`
        SELECT skills, education_level, major
        FROM learned_role_entries
        WHERE LOWER(role_name) = LOWER(${normalized})
      `;

      const totalEntries = rows.length;
      if (totalEntries === 0) return;

      // Hitung frekuensi setiap skill
      const skillCounts: Record<string, number> = {};
      for (const row of rows) {
        const uniqueSkillsInEntry = new Set(
          (row.skills || []).map((s) => s.trim().toLowerCase()).filter(Boolean)
        );
        for (const skill of uniqueSkillsInEntry) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      }

      // Format kembali nama skill dengan kapitalisasi terbaik
      const displayNameMap: Record<string, string> = {};
      for (const row of rows) {
        for (const s of row.skills || []) {
          const trimmed = s.trim();
          const lower = trimmed.toLowerCase();
          if (!displayNameMap[lower] || trimmed.length > displayNameMap[lower].length) {
            displayNameMap[lower] = trimmed;
          }
        }
      }

      // Klasifikasikan ke essential (>= 40% peminat) dan nice-to-have (20% - 39%)
      const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);

      const essential: string[] = [];
      const niceToHave: string[] = [];

      for (const [skillLower, count] of sortedSkills) {
        const ratio = count / totalEntries;
        const displayName = displayNameMap[skillLower] || skillLower;
        if (ratio >= 0.4 || essential.length < 3) {
          essential.push(displayName);
        } else if (ratio >= 0.2 || niceToHave.length < 3) {
          niceToHave.push(displayName);
        }
      }

      // Deteksi kategori sederhana
      let category = 'other';
      const roleLower = normalized.toLowerCase();
      if (/desain|design|grafis|fashion|art|video|foto/i.test(roleLower)) category = 'creative';
      else if (/dev|program|tech|data|code|it|qa|sistem/i.test(roleLower)) category = 'tech';
      else if (/market|pemasaran|sales|sosmed|content/i.test(roleLower)) category = 'marketing';
      else if (/operasional|admin|logistik|gudang/i.test(roleLower)) category = 'operations';
      else if (/akuntan|finance|keuangan|pajak/i.test(roleLower)) category = 'finance';
      else if (/kasir|barista|cafe|resto|toko/i.test(roleLower)) category = 'fnb_retail';
      else if (/guru|tutor|ajar|edukasi/i.test(roleLower)) category = 'education';

      // Upsert ke learned_role_blueprints
      await prisma.$executeRaw`
        INSERT INTO learned_role_blueprints (
          id, role_name, entry_count, top_essential_skills, top_nicetohave_skills, category, is_promoted, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${normalized},
          ${totalEntries},
          ${essential}::text[],
          ${niceToHave}::text[],
          ${category},
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (role_name)
        DO UPDATE SET
          entry_count = ${totalEntries},
          top_essential_skills = ${essential}::text[],
          top_nicetohave_skills = ${niceToHave}::text[],
          category = ${category},
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('[LearnedRoleService] aggregateRole error:', error);
    }
  },

  /**
   * Ambil semua blueprint hasil pembelajaran yang sudah aktif (entry_count >= 3 atau is_promoted = true)
   */
  async getActiveLearnedBlueprints(): Promise<LearnedBlueprintRecord[]> {
    try {
      const blueprints = await prisma.$queryRaw<LearnedBlueprintRecord[]>`
        SELECT id, role_name, entry_count, top_essential_skills, top_nicetohave_skills, category, is_promoted, created_at, updated_at
        FROM learned_role_blueprints
        WHERE entry_count >= 3 OR is_promoted = true
        ORDER BY entry_count DESC
      `;
      return blueprints;
    } catch (error) {
      console.error('[LearnedRoleService] getActiveLearnedBlueprints error:', error);
      return [];
    }
  }
};
