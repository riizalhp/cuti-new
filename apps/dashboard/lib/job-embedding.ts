import { prisma } from '@employr/db';
import { generateEmbedding, computeEmbeddingHash } from './embedding-service';

/**
 * Sinkronisasi vektor embedding untuk lowongan kerja ke dalam tabel job_embeddings.
 * Berjalan secara non-blocking di background agar proses ingestion/sync loker tidak terhambat.
 */
export async function syncJobEmbedding(job: {
  id: string;
  title: string;
  location?: string | null;
  requirements?: any;
  description?: string | null;
}): Promise<void> {
  if (!job?.id || !job?.title) return;

  try {
    const reqText = Array.isArray(job.requirements)
      ? job.requirements.join(', ')
      : typeof job.requirements === 'string'
      ? job.requirements
      : '';

    const textContent = `${job.title}. Lokasi: ${job.location || 'Indonesia'}. Kualifikasi: ${reqText}. ${
      job.description || ''
    }`.slice(0, 1500);

    const hash = computeEmbeddingHash(textContent);

    const existing = await (prisma as any).$queryRaw`
      SELECT content_hash FROM job_embeddings WHERE job_id = ${job.id}::uuid LIMIT 1;
    `;

    if (Array.isArray(existing) && existing.length > 0 && existing[0].content_hash === hash) {
      return; // Sudah up-to-date
    }

    const vector = await generateEmbedding(textContent, 'passage');
    const vectorStr = `[${vector.join(',')}]`;

    await (prisma as any).$executeRaw`
      INSERT INTO job_embeddings (id, job_id, embedding, content_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), ${job.id}::uuid, ${vectorStr}::vector, ${hash}, NOW(), NOW())
      ON CONFLICT (job_id) DO UPDATE
      SET embedding = ${vectorStr}::vector,
          content_hash = ${hash},
          updated_at = NOW();
    `;
  } catch (err: any) {
    console.warn(`[Job Embedding Sync] Gagal simpan embedding job ${job.id}:`, err?.message);
  }
}
