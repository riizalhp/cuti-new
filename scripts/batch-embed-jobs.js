/**
 * Batch Embedding Pipeline for Jobs in PostgreSQL
 * Uses multilingual-e5-small via @xenova/transformers
 * Run: node scripts/batch-embed-jobs.js [--limit=500] [--batch=25]
 */

const { createRequire } = require('module');
const path = require('path');
const { pathToFileURL } = require('url');
const crypto = require('crypto');

const dbRequire = createRequire(path.resolve(__dirname, '../packages/db/package.json'));
const { PrismaClient } = require(path.resolve(__dirname, '../packages/db/src/generated/client'));

const prisma = new PrismaClient();

let pipelinePromise = null;

async function getExtractor() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const appRequire = createRequire(path.resolve(__dirname, '../apps/dashboard/package.json'));
      const xenovaPath = appRequire.resolve('@xenova/transformers');
      const { pipeline, env } = await import(pathToFileURL(xenovaPath).href);
      env.cacheDir = './.cache/transformers';
      const pipe = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
        quantized: true,
      });
      return pipe;
    })();
  }
  return pipelinePromise;
}

async function generateVector(text) {
  const extractor = await getExtractor();
  const cleaned = text.replace(/\s+/g, ' ').trim().slice(0, 1500);
  const prompt = `passage: ${cleaned}`;
  const output = await extractor(prompt, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function computeHash(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

async function run() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const batchArg = args.find((a) => a.startsWith('--batch='));

  const maxTotal = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 10;

  console.log(`=== Memulai Batch Embedding Loker ===`);
  console.log(`Target: Maksimal ${maxTotal} lowongan | Batch size: ${batchSize}`);

  const totalActive = await prisma.jobs.count({ where: { is_active: true } });
  const totalEmbedded = await prisma.job_embeddings.count();
  console.log(`Total Loker Aktif: ${totalActive} | Sudah Memiliki Embedding: ${totalEmbedded}`);

  // Query jobs that don't have embeddings yet
  const pendingJobs = await prisma.$queryRawUnsafe(`
    SELECT j.id, j.title, j.location, j.requirements, j.description
    FROM jobs j
    LEFT JOIN job_embeddings je ON j.id = je.job_id
    WHERE j.is_active = true AND je.id IS NULL
    ORDER BY j.created_at DESC
    LIMIT ${maxTotal};
  `);

  if (!Array.isArray(pendingJobs) || pendingJobs.length === 0) {
    console.log('✓ Semua lowongan target sudah memiliki vektor embedding.');
    return;
  }

  console.log(`Ditemukan ${pendingJobs.length} lowongan yang belum di-embed. Memproses...`);

  let processed = 0;
  for (let i = 0; i < pendingJobs.length; i += batchSize) {
    const chunk = pendingJobs.slice(i, i + batchSize);
    console.log(`\nMemproses batch ${Math.floor(i / batchSize) + 1} (${chunk.length} loker)...`);

    for (const job of chunk) {
      try {
        const reqText = Array.isArray(job.requirements)
          ? job.requirements.join(', ')
          : typeof job.requirements === 'string'
          ? job.requirements
          : '';

        const textContent = `${job.title}. Lokasi: ${job.location || 'Indonesia'}. Kualifikasi: ${reqText}. ${
          job.description || ''
        }`.slice(0, 1500);

        const hash = computeHash(textContent);
        const vector = await generateVector(textContent);
        const vectorStr = `[${vector.join(',')}]`;

        await prisma.$executeRawUnsafe(`
          INSERT INTO job_embeddings (id, job_id, embedding, content_hash, created_at, updated_at)
          VALUES (gen_random_uuid(), '${job.id}'::uuid, '${vectorStr}'::vector, '${hash}', NOW(), NOW())
          ON CONFLICT (job_id) DO UPDATE
          SET embedding = '${vectorStr}'::vector,
              content_hash = '${hash}',
              updated_at = NOW();
        `);

        processed++;
        process.stdout.write(`✓ [${processed}/${pendingJobs.length}] ${job.title.slice(0, 30)}...\n`);
      } catch (err) {
        console.error(`✗ Gagal embed job ${job.id}:`, err.message);
      }
    }
  }

  const newTotal = await prisma.job_embeddings.count();
  console.log(`\n=== Selesai! Total Embedding Sekarang: ${newTotal} ===`);
}

run()
  .catch((e) => console.error('Error batch embedding:', e))
  .finally(() => prisma.$disconnect());
