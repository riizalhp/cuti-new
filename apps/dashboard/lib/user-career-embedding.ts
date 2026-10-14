import { prisma } from '@employr/db';
import { generateEmbedding, computeEmbeddingHash } from './embedding-service';

/**
 * Generates and syncs vector embedding for a user's CV/career profile in PostgreSQL.
 * Runs non-blocking in background to keep UI interactions instant.
 */
export async function syncUserCvEmbedding(userId: string, cvData: any, cvId?: string): Promise<void> {
  if (!userId || !cvData) return;

  try {
    const targetRoles = Array.isArray(cvData.targetPositions)
      ? cvData.targetPositions.join(', ')
      : cvData.targetPositions || cvData.target_position || cvData.headline || '';

    const rawSkills = Array.isArray(cvData.skills)
      ? cvData.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
      : Array.isArray(cvData.skillsList)
      ? cvData.skillsList
      : [];
    const skills = rawSkills.filter(Boolean).slice(0, 25).join(', ');

    const recentRoles = Array.isArray(cvData.experience)
      ? cvData.experience.map((e: any) => e.role || e.position).filter(Boolean).slice(0, 3)
      : [];

    const eduItem = cvData.education?.[0] || cvData.educations?.[0];
    const eduInfo = eduItem
      ? `${eduItem.degree || ''} ${eduItem.major || ''} di ${eduItem.institution || eduItem.school || ''}`.trim()
      : `${cvData.educationLevel || ''} ${cvData.major || ''} di ${cvData.institutionName || ''}`.trim();

    // Concise summary to avoid diluting the core intent with generic buzzwords
    const summary = (cvData.summary || '').slice(0, 160).trim();

    // Slot-based structured prompting for multilingual-e5-small
    const parts: string[] = [];
    if (targetRoles) parts.push(`Target Karier: ${targetRoles}`);
    if (recentRoles.length > 0) parts.push(`Riwayat Posisi: ${recentRoles.join(', ')}`);
    if (skills) parts.push(`Keahlian: ${skills}`);
    if (eduInfo) parts.push(`Pendidikan: ${eduInfo}`);
    if (summary) parts.push(`Ringkasan: ${summary}`);

    const profileText = parts.join(' | ');
    if (!profileText || profileText.length < 5) return;

    const hash = computeEmbeddingHash(profileText);

    // Check if existing embedding hash matches to avoid redundant inference
    const existing = await (prisma as any).$queryRaw`
      SELECT content_hash FROM user_career_embeddings WHERE user_id = ${userId}::uuid LIMIT 1;
    `;

    if (Array.isArray(existing) && existing.length > 0 && existing[0].content_hash === hash) {
      return; // Already up-to-date
    }

    const vector = await generateEmbedding(profileText, 'query');
    const vectorStr = `[${vector.join(',')}]`;

    await (prisma as any).$executeRaw`
      INSERT INTO user_career_embeddings (id, user_id, cv_id, embedding, content_hash, updated_at)
      VALUES (
        gen_random_uuid(),
        ${userId}::uuid,
        ${cvId ? `${cvId}::uuid` : null},
        ${vectorStr}::vector,
        ${hash},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET embedding = ${vectorStr}::vector,
          content_hash = ${hash},
          cv_id = COALESCE(${cvId ? `${cvId}::uuid` : null}, user_career_embeddings.cv_id),
          updated_at = NOW();
    `;
  } catch (err: any) {
    console.warn('[User Career Embedding Sync] Gagal sinkronisasi vektor:', err.message);
  }
}
