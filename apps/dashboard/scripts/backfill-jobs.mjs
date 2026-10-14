import { PrismaClient } from '../../../packages/db/src/generated/client/index.js';
import { generateEmbedding, computeEmbeddingHash } from '../lib/embedding-service.ts';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5440/employr',
    },
  },
});

async function backfillJobs(limit = 100) {
  console.log(`Starting backfill for up to ${limit} jobs...`);
  const startTime = Date.now();

  // Find active jobs that don't have embeddings yet
  const jobsToProcess = await prisma.$queryRaw`
    SELECT j.id, j.title, j.location, j.description, j.tags, c.name as company_name
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_embeddings je ON j.id = je.job_id
    WHERE j.is_active = true AND je.id IS NULL
    LIMIT ${limit};
  `;

  console.log(`Found ${jobsToProcess.length} jobs needing embeddings.`);
  if (jobsToProcess.length === 0) {
    console.log('All targeted jobs already have embeddings!');
    return;
  }

  let successCount = 0;

  for (let i = 0; i < jobsToProcess.length; i++) {
    const job = jobsToProcess[i];
    const tagsStr = Array.isArray(job.tags) ? job.tags.join(', ') : '';
    const cleanDesc = (job.description || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').slice(0, 800);
    const textToEmbed = `${job.title} di ${job.company_name || 'Perusahaan'}. Lokasi: ${job.location || 'Indonesia'}. Kategori/Tag: ${tagsStr}. Ringkasan: ${cleanDesc}`;

    const hash = computeEmbeddingHash(textToEmbed);
    try {
      const vector = await generateEmbedding(textToEmbed, 'passage');
      const vectorStr = `[${vector.join(',')}]`;

      await prisma.$executeRaw`
        INSERT INTO job_embeddings (id, job_id, embedding, content_hash, created_at, updated_at)
        VALUES (gen_random_uuid(), ${job.id}::uuid, ${vectorStr}::vector, ${hash}, NOW(), NOW())
        ON CONFLICT (job_id) DO UPDATE
        SET embedding = ${vectorStr}::vector, content_hash = ${hash}, updated_at = NOW();
      `;

      successCount++;
      if ((i + 1) % 10 === 0 || i === jobsToProcess.length - 1) {
        console.log(`Processed ${i + 1}/${jobsToProcess.length} jobs... (${Date.now() - startTime}ms)`);
      }
    } catch (err) {
      console.warn(`Failed job ${job.id}:`, err.message);
    }
  }

  console.log(`Backfill completed: ${successCount} jobs embedded in ${Date.now() - startTime}ms.`);
}

backfillJobs(100).catch(console.error).finally(() => prisma.$disconnect());
