/**
 * Mini Prompt & Exact Cache Key Helper for Bullet Optimization
 */

/**
 * Generate mode-aware cache key for exact instant reuse
 * Format: hash(task + bullet + role + mode + language)
 */
export function generateExactCacheKey(params: {
  task: string;
  bullet: string;
  role?: string;
  mode?: string;
  language?: string;
  feature?: string;
  systemPrompt?: string;
}): string {
  const normalized = [
    params.feature || 'general',
    params.systemPrompt || 'default',
    (params.role || 'professional').toLowerCase().trim(),
    (params.mode || 'auto').toLowerCase().trim(),
    params.language || 'id',
    params.bullet.toLowerCase().trim().replace(/\s+/g, ' '),
  ].join(':');

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `opt_${Math.abs(hash).toString(36)}`;
}

/**
 * Fixed Mini System Rules (Micro-prompt, ~50 tokens only)
 * Bahasa Indonesia agar konsisten dengan user prompt & persona DB (ai_prompts).
 */
export const FIXED_MINI_SYSTEM_PROMPT = `Anda adalah mesin optimasi bullet CV profesional.
Aturan:
- Jangan pernah mengarang pencapaian, metrik, tools, atau tanggung jawab.
- Pertahankan makna faktual dari input.
- Gunakan kata kerja aksi Indonesia yang kuat.
- Buat ringkas, berorientasi dampak, dan ramah ATS.
- Kembalikan HANYA array JSON sesuai format yang diminta, tanpa markdown.`;

/**
 * Build Micro Payload User Prompt (Very small input tokens)
 */
export function buildMicroUserPrompt(params: {
  task: string;
  bullet: string;
  role?: string;
  mode?: string;
  isBulletSection?: boolean;
}): string {
  const sectionFormat = params.isBulletSection
    ? 'Return array of 3 options, each with 3-4 bullet points (• Point 1\\n• Point 2\\n• Point 3).'
    : 'Return array of 3 options, each as a concise professional paragraph.';

  return `TASK: ${params.task}
ROLE: ${params.role || 'Professional'}
MODE: ${params.mode || 'auto'}
BULLET: "${params.bullet}"
FORMAT: ${sectionFormat}

JSON output schema:
[
  { "id": "opt-1", "label": "Opsi 1 — High Impact", "formulaTag": "CAR + Impact", "text": "..." },
  { "id": "opt-2", "label": "Opsi 2 — ATS Optimized", "formulaTag": "ATS Keywords", "text": "..." },
  { "id": "opt-3", "label": "Opsi 3 — Concise & Action", "formulaTag": "XYZ Action", "text": "..." }
]`;
}

/**
 * Local NLG (Natural Language Generation) Template Engine
 * Generates instant CV bullet drafts without API calls for simple inputs.
 * Anti-fabrication: hanya menyusun ulang input user — tidak pernah mengarang
 * angka, metrik, atau pencapaian. Angka wajib diisi user via placeholder [..].
 */
export function tryLocalTemplateGeneration(
  inputText: string,
  sectionTitle: string,
  targetJobTitle: string
): Array<{ id: string; label: string; formulaTag: string; text: string }> | null {
  const trimmed = inputText.trim();
  if (trimmed.length > 120) return null; // Use API for complex inputs

  const cleanText = trimmed.replace(/^(saya|pernah|tugas|tanggung jawab|bekerja|membuat)\s+/i, '');
  const role = targetJobTitle || 'Professional';

  const verbs = ['Memimpin', 'Mengembangkan', 'Mengoptimalkan', 'Mendesain', 'Mengelola'];
  const verb1 = verbs[Math.abs(cleanText.length) % verbs.length];
  const verb2 = verbs[(Math.abs(cleanText.length) + 2) % verbs.length];

  return [
    {
      id: 'opt-local-1',
      label: 'Opsi 1 — CAR (Challenge, Action, Result)',
      formulaTag: 'CAR + Isi metrikmu',
      text: `• ${verb1} inisiatif ${cleanText.toLowerCase()} untuk meningkatkan efisiensi operasional.\n• Mengidentifikasi hambatan teknis dan menyelesaikannya agar hasil kerja berkualitas tinggi.\n• Hasil: [tambahkan hasil terukur, mis. hemat waktu X% atau selesai X hari lebih cepat].`,
    },
    {
      id: 'opt-local-2',
      label: 'Opsi 2 — XYZ (Result, Measurement, Action)',
      formulaTag: 'XYZ + Isi metrikmu',
      text: `• Hasil: [tambahkan dampak utama dari ${cleanText.toLowerCase()}, mis. kepuasan klien naik X%].\n• ${verb2} ${cleanText.toLowerCase()} secara terstruktur dari perencanaan hingga evaluasi.\n• Skala: [tambahkan skala kerja, mis. tim X orang / X proyek / X klien].`,
    },
    {
      id: 'opt-local-3',
      label: 'Opsi 3 — ATS Optimized',
      formulaTag: 'ATS Keywords',
      text: `• ${verb2} alur kerja ${role.toLowerCase()} terkait ${cleanText.toLowerCase()} sesuai terminologi standar industri.\n• Berkolaborasi dengan tim terkait untuk memastikan eksekusi berjalan sesuai rencana.\n• Hasil: [tambahkan hasil terukur dengan kata kunci posisi target].`,
    },
  ];
}
