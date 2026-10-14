// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  cleanRoleTitle,
  extractCanonicalBackgroundRole,
  synthesizeRoleBlueprint,
  normalizeExpressiveLengthening,
  canonicalizeRoleTitle,
  isJokeOrJunkRole,
} from '@/lib/dynamic-role-synthesizer';

describe('Dynamic Role Synthesizer (Zero-Shot First Mover Engine & Anti-Junk Firewall)', () => {
  it('berhasil mengompresi huruf berulang ekspresif (expressive character lengthening)', () => {
    expect(normalizeExpressiveLengthening('PROOOOOOOOJECT MANAAAAAAAAAGEEEEEER')).toBe('PROJECT MANAGER');
    expect(normalizeExpressiveLengthening('desaiiin grafissss')).toBe('desain grafis');
    expect(normalizeExpressiveLengthening('baristaaaaa')).toBe('barista');
  });

  it('berhasil melakukan auto-canonicalization fuzzy Levenshtein untuk typo umum', () => {
    // Exact or typo variation automatically maps to canonical role
    expect(canonicalizeRoleTitle('PROOOOOOOOJECT MANAAAAAAAAAGEEEEEER')).toBe('Project Manager');
    expect(canonicalizeRoleTitle('Project Mannager')).toBe('Project Manager');
    expect(canonicalizeRoleTitle('Costumer Service')).toBe('Customer Service');
    expect(canonicalizeRoleTitle('Graphic Desainer')).toBe('Graphic Designer');
    expect(canonicalizeRoleTitle('Admnin Staff')).toBe('Admin Staff');
  });

  it('berhasil mendeteksi dan menolak kata lelucon, slang, dan keyboard smash', () => {
    // Jokes / Slang
    expect(isJokeOrJunkRole('Beban Keluarga').isJunk).toBe(true);
    expect(isJokeOrJunkRole('CEO Rebahan').isJunk).toBe(true);
    expect(isJokeOrJunkRole('Sultan Jagat Raya').isJunk).toBe(true);
    expect(isJokeOrJunkRole('Pengangguran Banyak Acara').isJunk).toBe(true);

    // Keyboard smash / no vowels
    expect(isJokeOrJunkRole('asdfghjkl').isJunk).toBe(true);
    expect(isJokeOrJunkRole('qwrtyp').isJunk).toBe(true);
    expect(isJokeOrJunkRole('zzzz').isJunk).toBe(true);

    // Valid career roles should NOT be flagged as junk
    expect(isJokeOrJunkRole('Project Manager').isJunk).toBe(false);
    expect(isJokeOrJunkRole('Customer Service').isJunk).toBe(false);
    expect(isJokeOrJunkRole('Dokter Spesialis Bedah').isJunk).toBe(false);
    expect(isJokeOrJunkRole('Agronomis').isJunk).toBe(false);
  });

  it('memastikan peran lelucon ditolak dan tidak pernah disintesis ke database', async () => {
    const { blueprint, vector } = await synthesizeRoleBlueprint('Beban Keluarga');
    expect(blueprint).toBeNull();
    expect(vector).toBeUndefined();
  });

  it('berhasil membersihkan gelar dan modifier organisasi dari judul posisi', () => {
    expect(cleanRoleTitle('Pelatih Kepala Atletik PASI DIY - Yogyakarta')).toBe('Pelatih Kepala Atletik PASI DIY');
    expect(cleanRoleTitle('PT Mandiri Sejahtera - Admin Staff')).toBe('Admin Staff');
    expect(extractCanonicalBackgroundRole('Pelatih Kepala Atletik PASI DIY')).toBe('Pelatih Fisik & Pembinaan Atlet');
    expect(extractCanonicalBackgroundRole('Dokter Umum RSUD Sardjito')).toBe('Dokter Umum');
  });

  it('berhasil menghasilkan blueprint instan (zero-shot) untuk profesi baru yang sah', async () => {
    const { blueprint, vector } = await synthesizeRoleBlueprint('Teknisi Pembangkit Listrik Tenaga Surya', {
      skills: ['Instalasi Panel Surya', 'Inverter AC/DC', 'Troubleshooting Kelistrikan', 'K3 Listrik'],
      major: 'Teknik Elektro',
    });

    expect(blueprint).toBeDefined();
    expect(blueprint?.title).toBe('Teknisi Pembangkit Listrik Tenaga Surya');
    expect(blueprint?.essentialSkills.length).toBeGreaterThanOrEqual(3);
    expect(blueprint?.isLearned).toBe(true);
    expect(blueprint?.typicalStrengths.length).toBeGreaterThan(0);
    expect(blueprint?.typicalGaps.length).toBeGreaterThan(0);
  }, 30000);
});
