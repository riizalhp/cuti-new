import { describe, it, expect } from 'vitest';
import { cleanBulletLine, parseCleanBulletLines, cleanBulletText } from '../lib/cv-bullets';

describe('cv-bullets utility', () => {
  describe('cleanBulletLine', () => {
    it('cleans standard unicode bullet •', () => {
      expect(cleanBulletLine('• Memimpin tim engineering')).toBe('Memimpin tim engineering');
    });

    it('cleans Word square bullet ▪ and circle ●', () => {
      expect(cleanBulletLine('▪ Mengkoordinasikan pelaksanaan rapat')).toBe('Mengkoordinasikan pelaksanaan rapat');
      expect(cleanBulletLine('● Mengembangkan fitur baru')).toBe('Mengembangkan fitur baru');
    });

    it('cleans en-dash and em-dash commonly inserted by Word/Docs', () => {
      expect(cleanBulletLine('– Melakukan audit sistem')).toBe('Melakukan audit sistem');
      expect(cleanBulletLine('— Memperbaiki 15 bug kritis')).toBe('Memperbaiki 15 bug kritis');
    });

    it('cleans double/chained bullet characters from Word or PDF imports', () => {
      expect(cleanBulletLine('• ▪ Memimpin tim 5 orang')).toBe('Memimpin tim 5 orang');
      expect(cleanBulletLine('- • Mengembangkan arsitektur')).toBe('Mengembangkan arsitektur');
      expect(cleanBulletLine('▪ ▪ Bertanggung jawab atas rilis')).toBe('Bertanggung jawab atas rilis');
      expect(cleanBulletLine('• - • Melakukan review kode')).toBe('Melakukan review kode');
    });

    it('cleans HTML bullet entities', () => {
      expect(cleanBulletLine('&bull; Mengelola database')).toBe('Mengelola database');
      expect(cleanBulletLine('&#8226; Mengoptimalkan query')).toBe('Mengoptimalkan query');
    });

    it('cleans numbered list prefixes', () => {
      expect(cleanBulletLine('1. Memimpin divisi teknologi')).toBe('Memimpin divisi teknologi');
      expect(cleanBulletLine('1) Mengkoordinasikan tim')).toBe('Mengkoordinasikan tim');
      expect(cleanBulletLine('a. Menyusun laporan mingguan')).toBe('Menyusun laporan mingguan');
    });

    it('preserves hyphens and metrics inside sentences', () => {
      expect(cleanBulletLine('• Meningkatkan performa 40-50% pada modul front-end')).toBe(
        'Meningkatkan performa 40-50% pada modul front-end'
      );
    });

    it('handles empty or whitespace strings', () => {
      expect(cleanBulletLine('')).toBe('');
      expect(cleanBulletLine('   ')).toBe('');
      expect(cleanBulletLine('•   ')).toBe('');
    });
  });

  describe('parseCleanBulletLines', () => {
    it('splits multiline strings and cleans each line', () => {
      const input = '• Poin satu\n▪ Poin dua\n- Poin tiga';
      expect(parseCleanBulletLines(input)).toEqual(['Poin satu', 'Poin dua', 'Poin tiga']);
    });

    it('handles inline bullets from PDF extractions without newlines', () => {
      const input = '• Tugas operasional harian • Koordinasi tim divisi • Pelaporan mingguan';
      expect(parseCleanBulletLines(input)).toEqual([
        'Tugas operasional harian',
        'Koordinasi tim divisi',
        'Pelaporan mingguan',
      ]);
    });

    it('handles mixed newlines and empty lines', () => {
      const input = '• Poin pertama\n\n\n• Poin kedua\n';
      expect(parseCleanBulletLines(input)).toEqual(['Poin pertama', 'Poin kedua']);
    });
  });

  describe('cleanBulletText', () => {
    it('returns multiline string without bullet prefixes', () => {
      const input = '• Memimpin proyek A\n▪ Mengembangkan modul B';
      expect(cleanBulletText(input)).toBe('Memimpin proyek A\nMengembangkan modul B');
    });
  });
});
