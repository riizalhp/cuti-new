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
}): string {
  const normalized = [
    params.task || 'optimize',
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
 */
export const FIXED_MINI_SYSTEM_PROMPT = `You are a professional CV bullet optimization engine.
Rules:
- Never fabricate achievements, metrics, tools, or responsibilities.
- Preserve factual meaning from input.
- Use strong Indonesian action verbs.
- Make it concise, impact-driven, and ATS-friendly.
- Return ONLY the JSON response array format requested without markdown.`;

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
 * Generates instant high-quality CV bullets without API calls for simple inputs
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
      formulaTag: 'CAR + Metrics',
      text: `• ${verb1} inisiatif ${cleanText.toLowerCase()} untuk meningkatkan efisiensi operasional.\n• Mengarahkan alur kerja tim secara terstruktur dengan kepatuhan deadline 95%.\n• Mengidentifikasi dan menyelesaikan hambatan teknis untuk mencapai hasil berkualitas tinggi.`,
    },
    {
      id: 'opt-local-2',
      label: 'Opsi 2 — XYZ (Result, Measurement, Action)',
      formulaTag: 'XYZ Formula',
      text: `• Mencapai peningkatan performa tim melalui eksekusi ${cleanText.toLowerCase()}.\n• Mengimplementasikan metodologi standar industri untuk mempercepat waktu pengerjaan.\n• Memastikan kualitas hasil kerja sesuai ekspektasi pemangku kepentingan (stakeholder).`,
    },
    {
      id: 'opt-local-3',
      label: 'Opsi 3 — ATS Optimized',
      formulaTag: 'ATS Keywords + Metrics',
      text: `• Mengelola alur kerja ${role.toLowerCase()} dan mengeksekusi strategi ${cleanText.toLowerCase()}.\n• Mengoptimalkan kolaborasi antar-tim untuk mencapai target kuantitatif bulanan.\n• Menerapkan evaluasi berkala guna menjamin akurasi dan efisiensi hasil.`,
    },
  ];
}
