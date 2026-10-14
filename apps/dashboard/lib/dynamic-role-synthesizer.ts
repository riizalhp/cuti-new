import { prisma } from '@employr/db';
import {
  ROLE_BLUEPRINTS,
  ROLE_ALIASES,
  RoleBlueprint,
} from './career-direction-engine';
import {
  generateEmbedding,
  calculateCosineSimilarity,
} from './embedding-service';
import { callAiGateway } from './ai-gateway';

// In-memory cache for dynamically synthesized blueprints & vectors
const synthesizedBlueprintCache = new Map<string, RoleBlueprint>();
const synthesizedVectorCache = new Map<string, number[]>();

// Lexical Blacklist for Jokes, Slang, and Non-Career Expressions
export const JOKE_OR_JUNK_KEYWORDS = [
  'rebahan', 'beban', 'sultan', 'gabut', 'santai', 'wkwk', 'stalker',
  'bucin', 'pacar', 'jomblo', 'trolling', 'hacker', 'judi', 'slot',
  'gacor', 'penipu', 'tidur', 'nongkrong', 'curhat', 'ngopi doang',
  'pengangguran', 'orang kaya', 'pesugihan', 'dukun', 'mencari cinta',
  'cari jodoh', 'selebgram gadungan', 'admin judol', 'scam', 'bot',
  'test', 'testing', 'asdf', 'qwerty', '12345'
];

/**
 * Normalizes expressive character lengthening (e.g. PROOOOOOOOJECT MANAAAAAAAAAGEEEEEER -> PROJECT MANAGER).
 * Collapses 3 or more consecutive identical characters down to 1.
 */
export function normalizeExpressiveLengthening(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/([a-zA-Z])\1{2,}/g, '$1');
}

/**
 * Calculates Levenshtein edit distance between two strings with O(N) memory.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  return row[n];
}

/**
 * Strips company prefixes, location suffixes, and parenthesized extras.
 */
export function cleanRoleTitle(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = normalizeExpressiveLengthening(raw)
    .trim()
    .replace(/[\(\[\{].*?[\)\]\}]/g, '') // Remove parenthesized extras like (Full-time)
    .replace(/\s+/g, ' ')
    .trim();

  // If separated by hyphen (e.g. "PT Mandiri - Admin Staff" or "Admin Staff - Yogyakarta")
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(/\s*-\s*/);
    const nonCompanyPart = parts.find(
      (p) =>
        !/(^pt\.?|\bpt\b|\bcv\b|\bcorp\b|\bltd\b|yogyakarta|jakarta|bandung|surabaya|semarang|bali|medan)/i.test(
          p
        )
    );
    cleaned = nonCompanyPart || parts[0];
  }

  return cleaned
    .replace(/^pt\.?\s+/i, '')
    .replace(/\s+pt\.?$/i, '')
    .replace(/\s+(ltd|corp|inc|tbk|grup|group)\b/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates whether an input is legitimate career text or junk / troll / keyboard smash.
 * Blocks AI Gateway calls early to prevent token drainage and database pollution.
 */
export function isJokeOrJunkRole(raw: string): { isJunk: boolean; reason?: string } {
  if (!raw || typeof raw !== 'string') {
    return { isJunk: true, reason: 'Input peran kosong atau tidak valid.' };
  }

  const normalized = normalizeExpressiveLengthening(raw).toLowerCase().trim();
  const clean = cleanRoleTitle(normalized);

  // 1. Length check
  if (clean.length < 3) {
    return { isJunk: true, reason: 'Nama posisi terlalu pendek (minimal 3 karakter).' };
  }
  if (clean.length > 55) {
    return { isJunk: true, reason: 'Nama posisi terlalu panjang (maksimal 55 karakter).' };
  }

  // 2. Pure symbol / digit check
  const lettersOnly = clean.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 3) {
    return { isJunk: true, reason: 'Nama posisi harus mengandung setidaknya 3 huruf alfabet.' };
  }

  // 3. Keyboard smash / no vowel check for words >= 4 chars
  const words = clean.split(/\s+/).filter((w) => w.length >= 4);
  if (words.length > 0 && words.some((w) => !/[aeiou]/i.test(w))) {
    return { isJunk: true, reason: 'Teks terdeteksi sebagai acakan keyboard (keyboard smash).' };
  }

  // 4. Excessive consonant streak (>= 5 consonants in a row, e.g. "bcdfgh")
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(clean)) {
    return { isJunk: true, reason: 'Teks terdeteksi mengandung deretan konsonan tidak wajar.' };
  }

  // 5. Joke / Slang Blacklist check
  for (const kw of JOKE_OR_JUNK_KEYWORDS) {
    if (clean.includes(kw) || normalized.includes(kw)) {
      return {
        isJunk: true,
        reason: `Peran mengandung istilah informal/non-karier: "${kw}".`,
      };
    }
  }

  return { isJunk: false };
}

/**
 * Fuzzy canonicalizes a raw role title against known blueprints & aliases.
 * Maps typos like "Project Mannager" -> "Project Manager" or "Costumer Service" -> "Customer Service"
 * without triggering an AI call.
 */
export function canonicalizeRoleTitle(rawRole: string): string {
  if (!rawRole || typeof rawRole !== 'string') return '';

  const normalized = normalizeExpressiveLengthening(rawRole);
  const cleaned = cleanRoleTitle(normalized);
  if (!cleaned || cleaned.length < 3) return cleaned;

  const lower = cleaned.toLowerCase();

  // A. Exact match in static blueprints
  if (ROLE_BLUEPRINTS[cleaned]) return ROLE_BLUEPRINTS[cleaned].title;
  for (const [key, bp] of Object.entries(ROLE_BLUEPRINTS)) {
    if (key.toLowerCase() === lower) return bp.title;
  }

  // B. Exact match in alias table
  if (ROLE_ALIASES[lower]) return ROLE_ALIASES[lower];

  // C. Fuzzy Levenshtein Distance (<= 2 edits)
  let bestMatch: string | null = null;
  let bestDistance = 999;

  for (const [title, bp] of Object.entries(ROLE_BLUEPRINTS)) {
    const tLower = title.toLowerCase();
    const dist = levenshteinDistance(lower, tLower);
    if (dist <= 2 && dist < bestDistance) {
      if (lower.length >= 6 || dist <= 1) {
        bestDistance = dist;
        bestMatch = bp.title;
      }
    }
  }

  for (const [alias, canonicalKey] of Object.entries(ROLE_ALIASES)) {
    const dist = levenshteinDistance(lower, alias);
    if (dist <= 2 && dist < bestDistance) {
      if (lower.length >= 6 || dist <= 1) {
        bestDistance = dist;
        bestMatch = ROLE_ALIASES[alias] || canonicalKey;
      }
    }
  }

  return bestMatch || cleaned;
}

/**
 * Extracts a canonical profession title from specific job titles
 * e.g. "Pelatih Kepala Atletik PASI DIY" -> "Pelatih Atletik"
 * "Asisten Pelatih Fisik SSB Garuda" -> "Pelatih Fisik"
 * "Dokter Umum RSUD Sardjito" -> "Dokter Umum"
 */
export function extractCanonicalBackgroundRole(rawTitle: string): string {
  const cleaned = cleanRoleTitle(rawTitle);
  if (!cleaned) return '';

  // Remove common organization names or location tokens
  const withoutOrgs = cleaned
    .replace(/\b(pasi|ssb|pplp|rsud|rsu|rs|puskesmas|klinik|kantor|cabang|diy|dki|jateng|jatim|jabar)\b.*$/i, '')
    .trim();

  // Strip modifier words (kepala, asisten, senior, junior, magang, intern) while keeping core profession
  const stripped = withoutOrgs
    .replace(/\b(kepala|asisten|assisten|senior|junior|lead|magang|intern|praktisi)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return canonicalizeRoleTitle(stripped || withoutOrgs || cleaned);
}

/**
 * Synthesizes a structured role blueprint on-the-fly for unknown/first-mover roles.
 * Includes Anti-Slop Validation, Adversarial AI Contract, and Centroid Vector Deduping (>= 0.88).
 */
export async function synthesizeRoleBlueprint(
  rawRoleName: string,
  candidateContext?: { skills?: string[]; major?: string }
): Promise<{ blueprint: RoleBlueprint | null; vector?: number[] }> {
  // 1. Canonicalize title and check troll firewall
  const canonicalTitle = canonicalizeRoleTitle(rawRoleName);
  const junkCheck = isJokeOrJunkRole(canonicalTitle);
  if (junkCheck.isJunk) {
    console.warn(`[Dynamic Role Synthesizer] Input ditolak oleh filter anti-sampah: "${rawRoleName}" (${junkCheck.reason})`);
    return { blueprint: null, vector: undefined };
  }

  const cleanTitle = canonicalTitle;
  const cacheKey = cleanTitle.toLowerCase();

  // Check in-memory cache
  if (synthesizedBlueprintCache.has(cacheKey)) {
    return {
      blueprint: synthesizedBlueprintCache.get(cacheKey)!,
      vector: synthesizedVectorCache.get(cacheKey),
    };
  }

  // 2. Attempt AI-driven synthesis via AI Gateway with strict validation contract
  let synthesized: RoleBlueprint | null = null;

  try {
    const prompt = `Evaluasi dan analisis peran pekerjaan ini di pasar tenaga kerja Indonesia: "${cleanTitle}".
${candidateContext?.skills?.length ? `Kandidat memiliki keahlian terkait: ${candidateContext.skills.slice(0, 8).join(', ')}.` : ''}
${candidateContext?.major ? `Latar belakang jurusan: ${candidateContext.major}.` : ''}

PENTING: Periksa apakah peran ini adalah profesi/pekerjaan nyata di dunia kerja formal maupun informal.
Jika peran ini adalah lelucon, slang, aktivitas harian biasa, ungkapan pribadi, atau kata acak (misal: "Beban Keluarga", "CEO Rebahan", "asdf"), kembalikan "is_valid_career": false dan JANGAN mengarang keahlian!

Berikan output HANYA berupa JSON valid tanpa format markdown (tanpa \`\`\`json):
{
  "is_valid_career": true,
  "rejection_reason": null,
  "title": "${cleanTitle}",
  "category": "tech" | "product" | "marketing" | "operations" | "design" | "business" | "finance" | "fnb_retail" | "education" | "creative" | "other",
  "essentialSkills": ["5 keahlian teknis/inti terpenting untuk peran ini"],
  "niceToHaveSkills": ["3 keahlian pendukung/nilai tambah"],
  "typicalStrengths": ["2 keunggulan tipikal pemegang peran ini"],
  "typicalGaps": ["2 tantangan/area gap umum jika melamar posisi ini"],
  "relatedTransitionalRoles": ["3 peran karier terdekat yang realistis untuk transisi"]
}`;

    const aiRes = await callAiGateway({
      prompt,
      feature: 'ROLE_BLUEPRINT_SYNTHESIS',
      promptName: 'Synthesize Role Blueprint',
      systemPrompt: 'Kamu adalah sistem analis taksonomi karier Indonesia. Tugasmu adalah menilai keabsahan profesi dan memetakan kompetensi. Balas hanya dengan JSON valid.',
      temperature: 0.1,
      maxTokens: 500,
    });

    if (aiRes?.text) {
      const cleanedJson = aiRes.text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);

      // Rejection check from AI
      if (parsed && parsed.is_valid_career === false) {
        console.warn(`[Dynamic Role Synthesizer] AI menolak peran "${cleanTitle}" karena bukan profesi nyata: ${parsed.rejection_reason}`);
        return { blueprint: null, vector: undefined };
      }

      if (parsed && Array.isArray(parsed.essentialSkills) && parsed.essentialSkills.length > 0) {
        synthesized = {
          title: cleanTitle,
          category: parsed.category || 'other',
          essentialSkills: parsed.essentialSkills.map((s: any) => String(s).trim()).filter(Boolean),
          niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills)
            ? parsed.niceToHaveSkills.map((s: any) => String(s).trim()).filter(Boolean)
            : [],
          typicalStrengths: Array.isArray(parsed.typicalStrengths)
            ? parsed.typicalStrengths.map((s: any) => String(s).trim()).filter(Boolean)
            : ['Komitmen profesional tinggi', 'Penguasaan keahlian praktis di bidangnya'],
          typicalGaps: Array.isArray(parsed.typicalGaps)
            ? parsed.typicalGaps.map((s: any) => String(s).trim()).filter(Boolean)
            : ['Adaptasi proses kerja digital', 'Sertifikasi kompetensi industri'],
          relatedTransitionalRoles: Array.isArray(parsed.relatedTransitionalRoles)
            ? parsed.relatedTransitionalRoles.map((s: any) => String(s).trim()).filter(Boolean)
            : ['Staf Operasional', 'Admin Staff'],
          isLearned: true,
          entryCount: 1,
        };
      }
    }
  } catch (err: any) {
    console.warn(`[Dynamic Role Synthesizer] AI synthesis gagal untuk "${cleanTitle}":`, err?.message);
  }

  // 3. Resilient Heuristic Fallback if AI is temporarily offline
  if (!synthesized) {
    const roleLower = cleanTitle.toLowerCase();
    let cat: RoleBlueprint['category'] = 'other';
    let defaultEssential: string[] = ['Komunikasi', 'Problem Solving', 'Time Management', 'Manajemen Tim'];
    let defaultNice: string[] = ['Microsoft Office', 'Pelaporan Kerja', 'Adaptasi Digital'];
    let defaultTransitional: string[] = ['Staf Operasional', 'Admin Staff', 'Customer Service'];

    if (/pelatih|olahraga|fitness|senam|atletik|coach/i.test(roleLower)) {
      cat = 'other';
      defaultEssential = ['Periodisasi Latihan', 'Kondisi Fisik', 'Teknik Olahraga', 'Manajemen Tim', 'Tes Kebugaran'];
      defaultNice = ['Analisis Video', 'Nutrisi Olahraga', 'Pertolongan Pertama / CPR', 'Microsoft Excel'];
      defaultTransitional = ['Instruktur Kebugaran', 'Guru / Tutor', 'Event Coordinator', 'Customer Service'];
    } else if (/dokter|medis|perawat|bidan|farmasi|kesehatan/i.test(roleLower)) {
      cat = 'other';
      defaultEssential = ['Pelayanan Pasien', 'Diagnosis & Prosedur Medis', 'Ketelitian Prosedur', 'Empati', 'Komunikasi Medis'];
      defaultNice = ['Administrasi Rekam Medis', 'Manajemen Farmasi', 'Kepatuhan SOP'];
      defaultTransitional = ['Staf Operasional Medis', 'Customer Care Kesehatan', 'Project Coordinator'];
    } else if (/guru|dosen|tutor|pengajar|instruktur/i.test(roleLower)) {
      cat = 'education';
      defaultEssential = ['Komunikasi', 'Penyusunan Materi', 'Kesabaran', 'Evaluasi Pembelajaran', 'Empati'];
      defaultNice = ['Google Classroom', 'Microsoft Office', 'Presentasi'];
      defaultTransitional = ['Content Writer', 'Customer Service', 'Human Resources Generalist'];
    } else if (/tani|kebun|agri|pangan|ternak|kehutanan/i.test(roleLower)) {
      cat = 'operations';
      defaultEssential = ['Budidaya Pertanian', 'Manajemen Lahan', 'Monitoring Kualitas', 'Pengoperasian Alat', 'Pencatatan Data'];
      defaultNice = ['Excel & Spreadsheet', 'Logistik Hasil Panen', 'SOP Agribisnis'];
      defaultTransitional = ['Staf Operasional', 'Quality Assurance', 'Staf Logistik & Gudang'];
    }

    // Blend in matched candidate skills if available
    if (candidateContext?.skills?.length) {
      for (const s of candidateContext.skills.slice(0, 3)) {
        if (!defaultEssential.some((e) => e.toLowerCase() === s.toLowerCase())) {
          defaultEssential.unshift(s);
        }
      }
    }

    synthesized = {
      title: cleanTitle,
      category: cat,
      essentialSkills: defaultEssential.slice(0, 6),
      niceToHaveSkills: defaultNice.slice(0, 4),
      typicalStrengths: ['Penguasaan operasional lapangan yang kuat', 'Ketangguhan kerja dan adaptasi tinggi'],
      typicalGaps: ['Otomasi proses kerja modern', 'Keahlian analitik data komprehensif'],
      relatedTransitionalRoles: defaultTransitional,
      isLearned: true,
      entryCount: 1,
    };
  }

  // 4. Generate 384-dimensional vector embedding
  let vector: number[] | undefined;
  try {
    const passageText = `${synthesized.title}. Bidang: ${synthesized.category}. Keahlian Inti: ${synthesized.essentialSkills.join(
      ', '
    )}. Keahlian Pendukung: ${synthesized.niceToHaveSkills.join(', ')}. Karakteristik dan kompetensi: ${synthesized.typicalStrengths.join(
      ', '
    )}`;
    vector = await generateEmbedding(passageText, 'passage');
  } catch (vecErr: any) {
    console.warn(`[Dynamic Role Synthesizer] Gagal generate vector untuk "${cleanTitle}":`, vecErr?.message);
  }

  // 5. Vector Centroid Proximity Gate (Threshold Cosine >= 0.88)
  // Prevent vector space smearing: if vector is >= 88% similar to an existing canonical blueprint,
  // DO NOT create a new vector record in PostgreSQL. Adopt existing canonical centroid!
  if (vector) {
    for (const [existingTitle, existingBp] of Object.entries(ROLE_BLUEPRINTS)) {
      const existingVec = synthesizedVectorCache.get(existingTitle.toLowerCase());
      if (existingVec) {
        const sim = calculateCosineSimilarity(vector, existingVec);
        if (sim >= 0.88) {
          console.log(`[Dynamic Role Synthesizer] Peran "${cleanTitle}" dilebur ke centroid "${existingTitle}" (kemiripan: ${(sim * 100).toFixed(1)}%). Mencegah pencemaran vektor.`);
          synthesizedBlueprintCache.set(cacheKey, existingBp);
          synthesizedVectorCache.set(cacheKey, existingVec);
          return { blueprint: existingBp, vector: existingVec };
        }
      }
    }
  }

  // 6. Persist truly novel blueprint to PostgreSQL learned_role_blueprints
  try {
    await (prisma as any).$executeRaw`
      INSERT INTO learned_role_blueprints (
        id, role_name, entry_count, top_essential_skills, top_nicetohave_skills, category, is_promoted, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${synthesized.title},
        1,
        ${synthesized.essentialSkills}::text[],
        ${synthesized.niceToHaveSkills}::text[],
        ${synthesized.category},
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (role_name) DO UPDATE SET
        entry_count = learned_role_blueprints.entry_count + 1,
        is_promoted = true,
        updated_at = NOW();
    `;
  } catch (dbErr: any) {
    console.warn(`[Dynamic Role Synthesizer] Gagal menyimpan blueprint "${cleanTitle}" ke DB:`, dbErr?.message);
  }

  // Store in memory cache
  synthesizedBlueprintCache.set(cacheKey, synthesized);
  if (vector) {
    synthesizedVectorCache.set(cacheKey, vector);
  }

  return { blueprint: synthesized, vector };
}

/**
 * Checks in-memory cache, DB learned blueprints, or performs on-demand synthesis.
 * Automatically canonicalizes input and rejects troll / joke titles early.
 */
export async function getOrSynthesizeRoleBlueprint(
  roleName: string,
  candidateContext?: { skills?: string[]; major?: string }
): Promise<{ blueprint: RoleBlueprint | null; vector?: number[] } | null> {
  const canonicalTitle = canonicalizeRoleTitle(roleName);
  if (!canonicalTitle || canonicalTitle.length < 3) return null;

  // Layer 1 Firewall: Reject joke / troll / keyboard smash
  const junkCheck = isJokeOrJunkRole(canonicalTitle);
  if (junkCheck.isJunk) {
    return null;
  }

  const cleanTitle = canonicalTitle;
  const cacheKey = cleanTitle.toLowerCase();

  // A. Check in-memory synthesized cache
  if (synthesizedBlueprintCache.has(cacheKey)) {
    return {
      blueprint: synthesizedBlueprintCache.get(cacheKey)!,
      vector: synthesizedVectorCache.get(cacheKey),
    };
  }

  // B. Check static blueprints directly
  if (ROLE_BLUEPRINTS[cleanTitle]) {
    return { blueprint: ROLE_BLUEPRINTS[cleanTitle] };
  }

  // C. Check database learned_role_blueprints
  try {
    const rows = await (prisma as any).$queryRaw<Array<{
      role_name: string;
      category: string;
      top_essential_skills: string[];
      top_nicetohave_skills: string[];
      entry_count: number;
    }>>`
      SELECT role_name, category, top_essential_skills, top_nicetohave_skills, entry_count
      FROM learned_role_blueprints
      WHERE LOWER(role_name) = LOWER(${cleanTitle})
      LIMIT 1
    `;

    if (rows && rows.length > 0) {
      const row = rows[0];
      const bp: RoleBlueprint = {
        title: row.role_name,
        category: (row.category as any) || 'other',
        essentialSkills: row.top_essential_skills || [],
        niceToHaveSkills: row.top_nicetohave_skills || [],
        typicalStrengths: ['Keahlian terverifikasi dari data kandidat nyata'],
        typicalGaps: ['Pendalaman keahlian spesifik industri'],
        relatedTransitionalRoles: ['Staf Operasional', 'Admin Staff'],
        isLearned: true,
        entryCount: row.entry_count || 1,
      };

      const passageText = `${bp.title}. Bidang: ${bp.category}. Keahlian Inti: ${bp.essentialSkills.join(
        ', '
      )}. Keahlian Pendukung: ${bp.niceToHaveSkills.join(', ')}`;
      const vec = await generateEmbedding(passageText, 'passage').catch(() => undefined);

      synthesizedBlueprintCache.set(cacheKey, bp);
      if (vec) synthesizedVectorCache.set(cacheKey, vec);

      return { blueprint: bp, vector: vec };
    }
  } catch (dbReadErr: any) {
    console.warn(`[Dynamic Role Synthesizer] Kendala query DB learned blueprints:`, dbReadErr?.message);
  }

  // D. Not found anywhere -> Synthesize on-demand (First-Mover Zero-Shot with AI validation)
  return synthesizeRoleBlueprint(cleanTitle, candidateContext);
}
