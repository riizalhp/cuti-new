import {
  ROLE_BLUEPRINTS,
  ROLE_ALIASES,
  ROLE_CATEGORY_LABELS,
  RoleBlueprint,
  CareerPathOption,
  DynamicRoleBlueprint,
  CareerDiagnosisResult,
  synthesizeMentorNarrative,
  extractTopAchievement,
  deriveTopStrength,
  deriveTopGap,
  areRolesSimilar,
  deduplicateRolePaths,
  filterOutLanguageSkills,
  skillMatches,
  isCandidateEligibleForGatedRole,
} from './career-direction-engine';
import {
  generateEmbedding,
  calculateCosineSimilarity,
  computeEmbeddingHash,
} from './embedding-service';
import { prisma } from '@employr/db';
import {
  getOrSynthesizeRoleBlueprint,
  extractCanonicalBackgroundRole,
  canonicalizeRoleTitle,
  isJokeOrJunkRole,
} from './dynamic-role-synthesizer';

import precomputedBlueprintVectors from './precomputed-blueprint-vectors.json';

// In-memory cache for precomputed static blueprint vectors (384-dimensional)
const blueprintVectorCache = new Map<string, number[]>();
if (precomputedBlueprintVectors && typeof precomputedBlueprintVectors === 'object') {
  for (const [title, vec] of Object.entries(precomputedBlueprintVectors as Record<string, number[]>)) {
    if (Array.isArray(vec)) {
      blueprintVectorCache.set(title, vec);
    }
  }
}
let isBlueprintCacheReady = blueprintVectorCache.size >= Object.keys(ROLE_BLUEPRINTS).length;
let blueprintInitPromise: Promise<void> | null = null;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function countSkillMatches(
  userSkills: string[],
  bpSkills: string[]
): { matched: string[]; gap: string[] } {
  const cleanSkills = filterOutLanguageSkills(userSkills);
  const matched: string[] = [];
  const gap: string[] = [];
  for (const bpSkill of bpSkills) {
    const found = cleanSkills.some((us) => skillMatches(us, bpSkill));
    if (found) matched.push(bpSkill);
    else gap.push(bpSkill);
  }
  return { matched, gap };
}

/**
 * Initializes and warms up the vector cache for all standard role blueprints.
 * Runs once lazily and stays in memory (~53 KB RAM footprint).
 */
export async function warmBlueprintEmbeddings(): Promise<void> {
  if (isBlueprintCacheReady) return;
  if (blueprintInitPromise) return blueprintInitPromise;

  blueprintInitPromise = (async () => {
    try {
      const entries = Object.entries(ROLE_BLUEPRINTS);
      for (const [title, bp] of entries) {
        if (!blueprintVectorCache.has(title)) {
          const passageText = `${bp.title}. Bidang: ${
            ROLE_CATEGORY_LABELS[bp.category] || bp.category
          }. Keahlian Inti: ${bp.essentialSkills.join(', ')}. Keahlian Pendukung: ${bp.niceToHaveSkills.join(
            ', '
          )}. Karakteristik dan kompetensi: ${bp.typicalStrengths.join(', ')}`;
          const vec = await generateEmbedding(passageText, 'passage');
          blueprintVectorCache.set(title, vec);
        }
      }
      isBlueprintCacheReady = true;
    } catch (err: any) {
      console.warn('[Warm Blueprint Embeddings] Kendala inisialisasi vektor blueprint:', err?.message);
    } finally {
      blueprintInitPromise = null;
    }
  })();

  return blueprintInitPromise;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  tech: [
    'informatika', 'komputer', 'sistem informasi', 'software', 'teknik', 'it', 'programming', 'elektro',
    'rekayasa perangkat lunak', 'rpl', 'tkj', 'teknik komputer dan jaringan', 'sistem komputer', 'perangkat lunak',
    'cyber security', 'data science', 'web development',
  ],
  design: [
    'desain', 'design', 'seni', 'visual', 'dkv', 'multimedia', 'arsitektur', 'desain grafis', 'desain komunikasi visual',
    'animasi', 'interior',
  ],
  marketing: [
    'pemasaran', 'marketing', 'komunikasi', 'advertising', 'public relation', 'ilmu komunikasi', 'jurnalistik',
    'pr', 'humas', 'hubungan masyarakat', 'digital marketing',
  ],
  business: [
    'manajemen', 'bisnis', 'business', 'administrasi bisnis', 'ekonomi', 'administrasi perkantoran', 'manajemen bisnis',
    'sdm', 'sumber daya manusia', 'human resources', 'human resource', 'hr', 'psikologi', 'manajemen sdm',
  ],
  finance: [
    'akuntansi', 'keuangan', 'finance', 'ekonomi', 'perbankan', 'pajak', 'perpajakan', 'administrasi keuangan',
    'akuntansi keuangan', 'syariah',
  ],
  operations: [
    'manajemen', 'administrasi', 'logistik', 'supply chain', 'event', 'turnamen', 'administrasi perkantoran',
    'perhotelan', 'operasional',
  ],
  creative: [
    'desain', 'seni', 'fashion', 'multimedia', 'film', 'fotografi', 'animasi', 'tata busana', 'broadcasting',
  ],
  fnb_retail: [
    'perhotelan', 'pariwisata', 'tata boga', 'culinary', 'hospitality', 'fitness', 'kebugaran', 'senam', 'retail', 'tata hidang',
  ],
  education: [
    'pendidikan', 'keguruan', 'pgsd', 'teaching', 'olahraga', 'kepelatihan', 'penjaskes', 'pjok', 'keolahragaan', 'atletik',
    'fkip', 'bimbingan konseling', 'pendidikan bahasa',
  ],
  product: ['informatika', 'manajemen', 'bisnis', 'sistem informasi', 'komputer', 'teknologi informasi'],
  other: [
    'olahraga', 'kepelatihan', 'kebugaran', 'kesehatan', 'medis', 'pertanian', 'keolahragaan', 'atletik',
    'keperawatan', 'kebidanan', 'farmasi', 'hukum', 'rekam medis',
  ],
};

export interface SemanticDiagnosisInput {
  aimingChoice: 'know_role' | 'exploring' | 'open_opportunities';
  targetRoleInput?: string;
  userSkills?: string[];
  educationLevel?: string;
  major?: string;
  hasExperience?: boolean | null;
  experienceTitle?: string;
  experienceCompany?: string;
  experiences?: any[];
  projects?: any[];
  topAchievementSnippet?: string | null;
  summary?: string;
  dynamicBlueprints?: DynamicRoleBlueprint[];
  userId?: string;
}

/**
 * Computes semantic career diagnosis by generating profile embeddings and evaluating
 * cosine vector proximity against role blueprints combined with honest skill match ratios.
 */
export async function computeSemanticCareerDiagnosis(
  input: SemanticDiagnosisInput
): Promise<CareerDiagnosisResult> {
  const {
    aimingChoice,
    targetRoleInput = '',
    userSkills = [],
    educationLevel = '',
    major = '',
    hasExperience,
    experienceTitle = '',
    experienceCompany = '',
    experiences = [],
    projects = [],
    topAchievementSnippet,
    summary = '',
    dynamicBlueprints = [],
    userId,
  } = input;

  // Extract real quantifiable achievements from experiences / projects / AI snippet
  const topAchievement = extractTopAchievement(experiences, projects, topAchievementSnippet);
  const cleanSkills = filterOutLanguageSkills(userSkills);

  // 1. Ensure static blueprint embeddings are ready
  await warmBlueprintEmbeddings();

  const rawRole = targetRoleInput.trim();

  // 2. Build candidate textual profile representation (strictly candidate qualifications)
  const experienceText = [experienceTitle, experienceCompany].filter(Boolean).join(' di ');
  const educationText = [educationLevel, major].filter(Boolean).join(' ');
  const skillsText = cleanSkills.slice(0, 20).join(', ');

  const candidateQuery = [
    skillsText ? `Keahlian utama: ${skillsText}` : '',
    experienceText ? `Pengalaman kerja: ${experienceText}` : '',
    topAchievement ? `Pencapaian terukur: ${topAchievement}` : '',
    educationText ? `Latar belakang pendidikan: ${educationText}` : '',
    summary ? `Ringkasan profesional: ${summary.slice(0, 300)}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  // 3. Generate candidate profile embedding vector (384-d normalized)
  const candidateVector = await generateEmbedding(candidateQuery, 'query');

  // Background non-blocking persistence to user_career_embeddings if user is authenticated
  if (userId) {
    (async () => {
      try {
        const hash = computeEmbeddingHash(candidateQuery);
        const vectorStr = `[${candidateVector.join(',')}]`;
        await (prisma as any).$executeRaw`
          INSERT INTO user_career_embeddings (id, user_id, cv_id, embedding, content_hash, updated_at)
          VALUES (
            gen_random_uuid(),
            ${userId}::uuid,
            NULL,
            ${vectorStr}::vector,
            ${hash},
            NOW()
          )
          ON CONFLICT (user_id) DO UPDATE
          SET embedding = ${vectorStr}::vector,
              content_hash = ${hash},
              updated_at = NOW();
        `;
      } catch (err: any) {
        console.warn('[Semantic Diagnosis] Gagal menyimpan user_career_embeddings:', err?.message);
      }
    })().catch(() => {});
  }

  // 4. Generate target role embedding if provided
  let targetRoleVector: number[] | null = null;
  if (rawRole) {
    targetRoleVector = await generateEmbedding(rawRole, 'query');
  }

  // 5. Build full blueprint collection (static + learned dynamic blueprints)
  const allBlueprints: RoleBlueprint[] = Object.values(ROLE_BLUEPRINTS);

  // If dynamic blueprints exist, generate their embeddings on-the-fly and append (filtering junk & duplicates)
  const dynamicMap = new Map<string, number[]>();
  if (Array.isArray(dynamicBlueprints) && dynamicBlueprints.length > 0) {
    for (const dyn of dynamicBlueprints) {
      if (!dyn.role_name || dyn.role_name.trim().length < 3) continue;
      const cleanDynName = dyn.role_name.trim();

      // Skip invalid company names or location suffixes (e.g. "Contsolution Development - Yogyakarta", "PT X")
      if (/(\s-\s|pt\s|^pt\.|\bcorp\b|\bltd\b)/i.test(cleanDynName)) {
        continue;
      }

      // Skip if already represented by an existing static or added blueprint
      const isAlreadyCovered = allBlueprints.some((b) => areRolesSimilar(b.title, cleanDynName));
      if (isAlreadyCovered) {
        continue;
      }

      const bpText = `${cleanDynName}. Keahlian Inti: ${dyn.top_essential_skills?.join(', ') || ''}. Keahlian Pendukung: ${dyn.top_nicetohave_skills?.join(', ') || ''}`;
      const dynVec = await generateEmbedding(bpText, 'passage');
      dynamicMap.set(cleanDynName, dynVec);

      allBlueprints.push({
        title: cleanDynName,
        category: (dyn.category as any) || 'other',
        essentialSkills: dyn.top_essential_skills || [],
        niceToHaveSkills: dyn.top_nicetohave_skills || [],
        relatedTransitionalRoles: [],
        typicalStrengths: [
          dyn.top_essential_skills?.length
            ? `Keahlian terpopuler: ${dyn.top_essential_skills.slice(0, 2).join(' & ')}`
            : 'Kemampuan adaptasi tinggi',
        ],
        typicalGaps: [
          dyn.top_essential_skills?.length > 2
            ? `Peningkatan di: ${dyn.top_essential_skills.slice(2, 4).join(' & ')}`
            : 'Pendalaman keahlian spesifik industri',
        ],
        isLearned: true,
        entryCount: dyn.entry_count || 1,
      });
    }
  }

  // 6. Find target blueprint or semantic closest role
  let targetBp: RoleBlueprint | null = null;
  let highestRoleBp: RoleBlueprint = allBlueprints[0];
  let highestRoleSimilarity = -1;

  const normalizedInput = rawRole.toLowerCase().trim();

  // A. Check exact key or alias
  for (const bp of allBlueprints) {
    if (bp.title.toLowerCase() === normalizedInput) {
      targetBp = bp;
      break;
    }
  }

  if (!targetBp) {
    for (const [alias, bpKey] of Object.entries(ROLE_ALIASES)) {
      if (normalizedInput === alias || normalizedInput.includes(alias) || alias.includes(normalizedInput)) {
        const found = allBlueprints.find((b) => b.title === bpKey || b.title.toLowerCase() === bpKey.toLowerCase());
        if (found) {
          targetBp = found;
          break;
        }
      }
    }
  }

  // B. Semantic Vector Closest Match if targetRoleVector exists
  if (targetRoleVector) {
    for (const bp of allBlueprints) {
      const bpVec = dynamicMap.get(bp.title) || blueprintVectorCache.get(bp.title);
      if (bpVec) {
        const sim = calculateCosineSimilarity(targetRoleVector, bpVec);
        if (sim > highestRoleSimilarity) {
          highestRoleSimilarity = sim;
          highestRoleBp = bp;
        }
      }
    }
  }

  // If still not matched, but semantic similarity is very high (>= 0.82), adopt that blueprint
  if (!targetBp && highestRoleSimilarity >= 0.82) {
    targetBp = highestRoleBp;
  }

  // C. First-Mover Zero-Shot: If target role is still not matched, synthesize on-demand!
  // BUT FIRST check if rawRole is troll / joke! If it's a joke or junk, do NOT synthesize!
  const targetJunkCheck = isJokeOrJunkRole(rawRole);
  if (!targetBp && rawRole.length >= 3 && !targetJunkCheck.isJunk) {
    try {
      const synthResult = await getOrSynthesizeRoleBlueprint(rawRole, {
        skills: cleanSkills,
        major,
      });
      if (synthResult?.blueprint) {
        targetBp = synthResult.blueprint;
        if (!allBlueprints.some((b) => b.title.toLowerCase() === targetBp!.title.toLowerCase())) {
          allBlueprints.push(targetBp);
        }
        if (synthResult.vector) {
          dynamicMap.set(targetBp.title, synthResult.vector);
        }
      }
    } catch (synthErr: any) {
      console.warn('[Semantic Diagnosis] On-demand synthesis error for target role:', synthErr?.message);
    }
  }

  // D. Ensure candidate's background career has a representative blueprint in allBlueprints!
  const expPrimaryRole = experienceTitle || experiences[0]?.role || '';
  const canonicalBgRole = extractCanonicalBackgroundRole(expPrimaryRole);
  if (
    canonicalBgRole &&
    canonicalBgRole.length >= 3 &&
    !allBlueprints.some(
      (b) =>
        areRolesSimilar(b.title, canonicalBgRole) ||
        b.title.toLowerCase() === canonicalBgRole.toLowerCase() ||
        ROLE_ALIASES[canonicalBgRole.toLowerCase()] === b.title
    )
  ) {
    try {
      const synthBg = await getOrSynthesizeRoleBlueprint(canonicalBgRole, {
        skills: cleanSkills,
        major,
      });
      if (synthBg?.blueprint) {
        const bgBp = synthBg.blueprint;
        if (!allBlueprints.some((b) => b.title.toLowerCase() === bgBp.title.toLowerCase())) {
          allBlueprints.push(bgBp);
        }
        if (synthBg.vector) {
          dynamicMap.set(bgBp.title, synthBg.vector);
        }
      }
    } catch (bgSynthErr: any) {
      console.warn('[Semantic Diagnosis] Background role synthesis error:', bgSynthErr?.message);
    }
  }

  // E. Ensure target role's related transitional roles are present in allBlueprints!
  if (targetBp && Array.isArray(targetBp.relatedTransitionalRoles) && targetBp.relatedTransitionalRoles.length > 0) {
    for (const transRole of targetBp.relatedTransitionalRoles) {
      if (!transRole || transRole.trim().length < 3) continue;
      const cleanTrans = transRole.trim();
      const isAlreadyPresent = allBlueprints.some(
        (b) =>
          b.title.toLowerCase() === cleanTrans.toLowerCase() ||
          areRolesSimilar(b.title, cleanTrans)
      );
      if (!isAlreadyPresent) {
        try {
          const synthTrans = await getOrSynthesizeRoleBlueprint(cleanTrans, {
            skills: cleanSkills,
            major,
          });
          if (synthTrans?.blueprint) {
            allBlueprints.push(synthTrans.blueprint);
            if (synthTrans.vector) {
              dynamicMap.set(synthTrans.blueprint.title, synthTrans.vector);
            }
          }
        } catch (transSynthErr: any) {
          console.warn(`[Semantic Diagnosis] Transitional role synthesis error for "${cleanTrans}":`, transSynthErr?.message);
        }
      }
    }
  }

  const isUnknownRole = !targetBp && rawRole.length > 0;

  // 7. Profile bonuses
  let profileBonus = 0;
  if (hasExperience) profileBonus += 4;
  else profileBonus += 2; // Starter potential bonus for fresh grads / entry-level seekers
  const eduLevel = (educationLevel || '').toUpperCase();
  if (['S1', 'D4', 'S2', 'S3'].includes(eduLevel)) profileBonus += 6;
  else if (['D3'].includes(eduLevel)) profileBonus += 4;
  else if (['SMK'].includes(eduLevel)) profileBonus += 4;
  else if (['SMA'].includes(eduLevel)) profileBonus += 3;

  const majorLower = (major || '').toLowerCase();

  // 8. Evaluate each blueprint with hybrid formula (Semantic Vector + Skill Match + Profile)
  const scoredPaths: (CareerPathOption & { semanticSimilarity: number })[] = [];

  for (const bp of allBlueprints) {
    const bpVec = dynamicMap.get(bp.title) || blueprintVectorCache.get(bp.title);
    const cosSim = bpVec ? calculateCosineSimilarity(candidateVector, bpVec) : 0.45;

    // Semantic vector similarity bonus (up to 18 points)
    const semanticBonus = Math.round(clamp((cosSim - 0.4) / 0.5, 0, 1) * 18);

    const essential = countSkillMatches(userSkills, bp.essentialSkills);
    const niceToHave = countSkillMatches(userSkills, bp.niceToHaveSkills);

    // Onboarding Adaptive Denominator:
    // When users quickly fill 1-4 skills during onboarding, evaluate match against provided input
    // rather than punishing them with exhaustive professional requirements.
    const userSkillCount = cleanSkills.length;
    const isLightweight = userSkillCount > 0 && userSkillCount <= 4;
    const essentialDenom = isLightweight
      ? Math.min(bp.essentialSkills.length, Math.max(2, userSkillCount))
      : (bp.essentialSkills.length || 1);
    const essentialRatio = essentialDenom > 0 ? clamp(essential.matched.length / essentialDenom, 0, 1) : 0;

    const niceDenom = isLightweight
      ? Math.min(bp.niceToHaveSkills.length, Math.max(2, userSkillCount))
      : (bp.niceToHaveSkills.length || 1);
    const niceRatio = niceDenom > 0 ? clamp(niceToHave.matched.length / niceDenom, 0, 1) : 0;

    // Hard skill match: up to 55 pts for essential skills + up to 15 pts for nice-to-have
    const skillScore = essentialRatio * 55 + niceRatio * 15;

    let majorBonus = 0;
    const relevantKeywords = bp.category ? CATEGORY_KEYWORDS[bp.category] || [] : [];
    if (
      majorLower &&
      (relevantKeywords.some((kw) => majorLower.includes(kw)) ||
        bp.essentialSkills.some((s) => majorLower.includes(s.toLowerCase())))
    ) {
      majorBonus = 6;
    }

    let titleBonus = 0;
    if (hasExperience && experienceTitle) {
      const expLower = experienceTitle.toLowerCase();
      const bpLower = bp.title.toLowerCase();
      if (
        expLower.includes(bpLower) ||
        bpLower.includes(expLower) ||
        areRolesSimilar(experienceTitle, bp.title) ||
        ROLE_ALIASES[expLower] === bp.title
      ) {
        titleBonus = 25; // Direct proven title match (e.g. was already Project Manager / Coordinator)
      } else if (bp.relatedTransitionalRoles.some((r) => expLower.includes(r.toLowerCase()))) {
        titleBonus = 16; // Related experience
      } else {
        const bpWords = bpLower.split(/[\s/&,-]+/).filter((w) => w.length > 2);
        const hasWordMatch = bpWords.some((w) => expLower.includes(w));
        if (hasWordMatch) {
          titleBonus = 18;
        } else {
          titleBonus = 4; // General work experience
        }
      }
    } else if (hasExperience) {
      titleBonus = 4;
    }

    // High alignment synergy bonus
    let alignmentBonus = 0;
    if (essentialRatio >= 0.5 && titleBonus >= 16) {
      alignmentBonus = 8;
    }

    const isTarget = targetBp ? bp.title === targetBp.title : false;
    const targetAspirationBonus = isTarget ? 6 : 0;

    // Direct domain transition synergy bonus if bp is explicitly defined in targetBp's transitional pathways
    let transitionDomainBonus = 0;
    if (
      targetBp &&
      !isTarget &&
      Array.isArray(targetBp.relatedTransitionalRoles) &&
      targetBp.relatedTransitionalRoles.some(
        (r) => r.toLowerCase() === bp.title.toLowerCase() || areRolesSimilar(r, bp.title)
      )
    ) {
      transitionDomainBonus = 14;
    }

    // Lightweight starter momentum bonus when at least 1 essential skill matches
    const starterMomentum = isLightweight && essential.matched.length > 0 ? 8 : 0;

    let finalFitScore = Math.round(
      skillScore +
        titleBonus +
        profileBonus +
        majorBonus +
        semanticBonus +
        alignmentBonus +
        targetAspirationBonus +
        transitionDomainBonus +
        starterMomentum
    );
    finalFitScore = clamp(finalFitScore, isTarget ? 25 : 15, 96);

    const isEligible = isCandidateEligibleForGatedRole(bp.title, {
      major,
      userSkills: cleanSkills,
      experienceTitle,
    });
    if (!isEligible) {
      if (isTarget) {
        finalFitScore = clamp(Math.min(finalFitScore, 42), 15, 42);
      } else {
        finalFitScore = clamp(Math.min(finalFitScore, 28), 10, 28);
      }
    }

    const allMatched = [...essential.matched, ...niceToHave.matched];

    const isCareerSwitch = Boolean(
      isTarget &&
      (majorBonus === 0 || titleBonus <= 4) &&
      (hasExperience || profileBonus >= 2) &&
      essentialRatio < 0.65
    );

    scoredPaths.push({
      role: bp.title,
      fitScore: finalFitScore,
      isPrimaryTarget: isTarget,
      isCareerSwitch,
      isLearned: bp.isLearned,
      isGatedBlocked: !isEligible,
      entryCount: bp.entryCount,
      tagline: !isEligible
        ? 'Jalur profesi khusus yang membutuhkan kualifikasi domain'
        : isCareerSwitch
        ? 'Target transisi karier baru'
        : isTarget
        ? 'Target posisi incaranmu'
        : 'Jalur alternatif relevan dengan profilmu',
      matchedSkills: allMatched.length > 0 ? allMatched.slice(0, 4) : [],
      gapSkills: essential.gap.slice(0, 3),
      isSemantic: true,
      semanticSimilarity: Math.round(cosSim * 100),
    });
  }

  // 9. Derive Diagnosis based on aiming choice & unknown role state
  if (isUnknownRole) {
    // Sort by hybrid score descending and deduplicate similar roles
    const eligiblePaths = scoredPaths.filter((p) =>
      isCandidateEligibleForGatedRole(p.role, { major, userSkills: cleanSkills, experienceTitle })
    );
    const sorted = deduplicateRolePaths([...eligiblePaths].sort((a, b) => b.fitScore - a.fitScore));
    const topPaths = sorted.slice(0, 4);
    if (topPaths.length > 0) {
      topPaths[0].isRealisticTransition = true;
    }

    const best = topPaths[0] || scoredPaths[0];
    const bestBp = allBlueprints.find((b) => b.title === best?.role) || highestRoleBp;

    const topStrength = deriveTopStrength(cleanSkills, bestBp, topAchievement);
    const topGap = deriveTopGap(cleanSkills, bestBp);

    const mentorNarrative = synthesizeMentorNarrative({
      educationLevel,
      major,
      hasExperience,
      experienceTitle,
      experienceCompany,
      userSkills: cleanSkills,
      primaryRole: rawRole,
      primaryFitScore: best?.fitScore || 65,
      matchedSkills: best?.matchedSkills || [],
      gapSkills: best?.gapSkills || [],
      realisticTransitionRole: bestBp.title,
      topAchievement,
    });

    const junkTarget = isJokeOrJunkRole(rawRole);
    const unknownRoleMessage = junkTarget.isJunk
      ? `Posisi "${rawRole}" tidak teridentifikasi sebagai profesi resmi di pasar kerja. Berdasarkan keahlianmu, berikut peran-peran terdekat yang paling sesuai:`
      : `Posisi "${rawRole}" belum tercatat langsung di database standar, tetapi sistem berhasil memetakan profilmu secara semantik ke peran terdekat "${bestBp.title}".`;

    return {
      aimingChoice,
      primaryRole: rawRole,
      primaryFitScore: best?.fitScore || 65,
      isUnknownRole: true,
      unknownRoleMessage,
      topStrength,
      topGap,
      gapSkillsList: bestBp ? countSkillMatches(cleanSkills, bestBp.essentialSkills).gap : [],
      matchedSkillsList: bestBp
        ? [
            ...countSkillMatches(cleanSkills, bestBp.essentialSkills).matched,
            ...countSkillMatches(cleanSkills, bestBp.niceToHaveSkills).matched,
          ]
        : cleanSkills,
      realisticTransition: {
        role: bestBp.title,
        fitScore: best?.fitScore || 70,
        reason: `Berdasarkan pemetaan keahlianmu, ${bestBp.title} memiliki kemiripan kompetensi tertinggi dengan target peran ini.`,
      },
      suggestedPaths: topPaths,
      isSemantic: true,
      mentorNarrative,
    };
  }

  let bp: RoleBlueprint;
  let primaryPath: CareerPathOption;
  let finalSuggestedPaths: CareerPathOption[];
  let bestTransition: CareerPathOption;
  let isCareerSwitch = false;

  if (aimingChoice === 'know_role') {
    // ── Track 1: Known Role ──
    bp = targetBp || highestRoleBp || allBlueprints[0];
    primaryPath =
      scoredPaths.find((p) => p.role === bp.title) || {
        role: bp.title,
        fitScore: 75,
        isPrimaryTarget: true,
        tagline: 'Target posisi incaranmu',
        matchedSkills: [],
        gapSkills: bp.essentialSkills.slice(0, 3),
        isSemantic: true,
        semanticSimilarity: 75,
      };
    primaryPath.isPrimaryTarget = true;

    // Filter other paths sorted by fit score descending and deduplicate similar roles
    const rawAlternativePaths = deduplicateRolePaths(
      scoredPaths
        .filter((p) => p.role !== bp.title && !areRolesSimilar(p.role, bp.title))
        .filter((p) => isCandidateEligibleForGatedRole(p.role, { major, userSkills: cleanSkills, experienceTitle }))
        .sort((a, b) => b.fitScore - a.fitScore)
    );

    // Filter out generic fallback roles (like Admin Staff, Customer Service) if higher-fit domain-aligned alternatives exist
    const highFitOptions = rawAlternativePaths.filter(
      (opt) => opt.fitScore >= 55 || !['Admin Staff', 'Customer Service', 'Staf Operasional'].includes(opt.role)
    );
    const prioritizedAlternatives = highFitOptions.length >= 3 ? highFitOptions : rawAlternativePaths;

    // Maximal Marginal Relevance (MMR) Diversity Gate:
    const diverseAlternatives: CareerPathOption[] = [];
    for (const alt of prioritizedAlternatives) {
      if (diverseAlternatives.length >= 3) break;

      const altVec = dynamicMap.get(alt.role) || blueprintVectorCache.get(alt.role);
      let isRedundantWithSelected = false;

      for (const sel of diverseAlternatives) {
        if (areRolesSimilar(alt.role, sel.role)) {
          isRedundantWithSelected = true;
          break;
        }
        if (altVec) {
          const selVec = dynamicMap.get(sel.role) || blueprintVectorCache.get(sel.role);
          if (selVec) {
            const sim = calculateCosineSimilarity(altVec, selVec);
            if (sim >= 0.965) {
              isRedundantWithSelected = true;
              break;
            }
          }
        }
      }

      if (!isRedundantWithSelected) {
        diverseAlternatives.push(alt);
      }
    }

    if (diverseAlternatives.length < 3) {
      for (const alt of prioritizedAlternatives) {
        if (diverseAlternatives.length >= 3) break;
        if (!diverseAlternatives.some((d) => d.role === alt.role || areRolesSimilar(d.role, alt.role))) {
          diverseAlternatives.push(alt);
        }
      }
    }

    const alternativePaths = diverseAlternatives.length > 0 ? diverseAlternatives : prioritizedAlternatives;

    bestTransition = alternativePaths[0] || primaryPath;
    if (bestTransition && bestTransition.role !== bp.title) {
      bestTransition.isRealisticTransition = true;
    }

    isCareerSwitch = Boolean(primaryPath.isCareerSwitch);

    const alternatives = alternativePaths.slice(0, 3);
    if (alternatives.length > 0 && alternatives[0].role !== bp.title) {
      alternatives[0].isRealisticTransition = true;
      if (isCareerSwitch && alternatives[0].fitScore >= 70) {
        alternatives[0].tagline = 'Posisi terkuat dari latar belakangmu';
      }
    }
    finalSuggestedPaths = deduplicateRolePaths([primaryPath, ...alternatives]);
  } else if (aimingChoice === 'exploring') {
    // ── Track 2: Exploring (Category Diversity Spektrum) ──
    const eligiblePaths = scoredPaths.filter((p) =>
      isCandidateEligibleForGatedRole(p.role, { major, userSkills: cleanSkills, experienceTitle })
    );
    const sorted = deduplicateRolePaths([...eligiblePaths].sort((a, b) => b.fitScore - a.fitScore));
    const topPrimary = sorted[0] || scoredPaths[0];
    topPrimary.isPrimaryTarget = true;
    topPrimary.tagline = 'Rekomendasi kecocokan terkuat dari keahlianmu';

    bp = allBlueprints.find((b) => b.title === topPrimary.role) || allBlueprints[0];
    primaryPath = topPrimary;

    const exploredAlternatives: CareerPathOption[] = [];
    const usedCategories = new Set<string>();
    if (bp.category) usedCategories.add(bp.category);

    // 1st pass: Pick roles from different categories with solid fitScore
    for (const opt of sorted.slice(1)) {
      if (exploredAlternatives.length >= 3) break;
      const optBp = allBlueprints.find((b) => b.title === opt.role);
      const cat = optBp?.category || 'other';
      if (!usedCategories.has(cat) && !areRolesSimilar(opt.role, topPrimary.role)) {
        usedCategories.add(cat);
        const catLabel = ROLE_CATEGORY_LABELS[cat] || 'Bidang Terkait';
        exploredAlternatives.push({
          ...opt,
          tagline: `Opsi eksplorasi bidang ${catLabel}`,
        });
      }
    }

    // 2nd pass: Backfill from remaining highest fit options
    for (const opt of sorted.slice(1)) {
      if (exploredAlternatives.length >= 3) break;
      if (
        opt.role !== topPrimary.role &&
        !exploredAlternatives.some((e) => e.role === opt.role || areRolesSimilar(e.role, opt.role))
      ) {
        const optBp = allBlueprints.find((b) => b.title === opt.role);
        const catLabel = optBp?.category ? ROLE_CATEGORY_LABELS[optBp.category] || 'Bidang Terkait' : 'Alternatif';
        exploredAlternatives.push({
          ...opt,
          tagline: `Opsi eksplorasi bidang ${catLabel}`,
        });
      }
    }

    if (exploredAlternatives.length > 0) {
      exploredAlternatives[0].isRealisticTransition = true;
    }

    bestTransition = exploredAlternatives[0] || topPrimary;
    finalSuggestedPaths = [topPrimary, ...exploredAlternatives];
  } else {
    // ── Track 3: Open Opportunities (Ready to Apply / Minimal Skill Gap) ──
    const eligiblePaths = scoredPaths.filter((p) =>
      isCandidateEligibleForGatedRole(p.role, { major, userSkills: cleanSkills, experienceTitle })
    );
    const readyScored = [...eligiblePaths]
      .map((opt) => {
        const gapPenalty = (opt.gapSkills?.length || 0) * 8;
        const matchedBonus = (opt.matchedSkills?.length || 0) * 3;
        return {
          ...opt,
          readyScore: opt.fitScore - gapPenalty + matchedBonus,
        };
      })
      .sort((a, b) => b.readyScore - a.readyScore);

    const sortedReady = deduplicateRolePaths(readyScored);
    const topReady = sortedReady[0] || scoredPaths[0];
    topReady.isPrimaryTarget = true;
    topReady.tagline = 'Peluang lolos screening tercepat (modal skill paling siap)';

    bp = allBlueprints.find((b) => b.title === topReady.role) || allBlueprints[0];
    primaryPath = topReady;

    const readyAlternatives = sortedReady.slice(1, 4).map((alt) => ({
      ...alt,
      tagline:
        (alt.gapSkills?.length || 0) === 0
          ? 'Siap lamar tanpa gap skill (100% modal terpenuhi)'
          : `Hanya butuh pelengkap ${alt.gapSkills?.length} skill kunci`,
    }));

    if (readyAlternatives.length > 0) {
      readyAlternatives[0].isRealisticTransition = true;
    }

    bestTransition = readyAlternatives[0] || topReady;
    finalSuggestedPaths = [topReady, ...readyAlternatives];
  }

  // Strengths & gaps with real achievement extraction
  const topStrength = deriveTopStrength(cleanSkills, bp, topAchievement);
  const topGap = deriveTopGap(cleanSkills, bp);
  const essentialMatches = countSkillMatches(cleanSkills, bp.essentialSkills);
  const niceMatches = countSkillMatches(cleanSkills, bp.niceToHaveSkills);

  const mentorNarrative = synthesizeMentorNarrative({
    educationLevel,
    major,
    hasExperience,
    experienceTitle,
    experienceCompany,
    userSkills: cleanSkills,
    primaryRole: bp.title,
    primaryFitScore: primaryPath.fitScore,
    matchedSkills: primaryPath.matchedSkills,
    gapSkills: primaryPath.gapSkills,
    realisticTransitionRole: bestTransition.role,
    topAchievement,
    isCareerSwitch,
    aimingChoice,
  });

  return {
    aimingChoice,
    primaryRole: bp.title,
    primaryFitScore: primaryPath.fitScore,
    isUnknownRole: false,
    isCareerSwitch,
    isLearnedRole: bp.isLearned,
    learnedCount: bp.entryCount,
    unknownRoleMessage: '',
    topStrength,
    topGap,
    gapSkillsList: essentialMatches.gap,
    matchedSkillsList: [...essentialMatches.matched, ...niceMatches.matched],
    realisticTransition: {
      role: bestTransition.role,
      fitScore: bestTransition.fitScore,
      reason:
        aimingChoice === 'exploring'
          ? `${bestTransition.role} menjadi opsi alternatif terdekat untuk mengeksplorasi cabang karier baru.`
          : aimingChoice === 'open_opportunities'
          ? `${bestTransition.role} memiliki probabilitas screening tinggi dengan gap kompetensi minimal.`
          : bestTransition.role !== bp.title
          ? isCareerSwitch
            ? `${bestTransition.role} adalah posisi terkuat dari riwayat profilmu (${bestTransition.fitScore}% fit), sementara ${bp.title} adalah target transisi barumu.`
            : `${bestTransition.role} memiliki kemiripan kompetensi tertinggi (${bestTransition.fitScore}% fit) sebagai jalur transisi realistis.`
          : `Profilmu sudah selaras optimal untuk ${bp.title}.`,
    },
    suggestedPaths: finalSuggestedPaths,
    isSemantic: true,
    mentorNarrative,
  };
}
