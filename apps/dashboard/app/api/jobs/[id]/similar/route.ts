import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { generateEmbedding, computeEmbeddingHash } from '@/lib/embedding-service';

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId || !isValidUUID(jobId)) {
      return NextResponse.json(
        { success: false, message: 'ID lowongan tidak valid.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '4', 10), 1), 10);

    // 1. Cek apakah job target ada di database
    const targetJob = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        location: true,
        requirements: true,
        description: true,
        work_type: true,
      },
    });

    if (!targetJob) {
      return NextResponse.json(
        { success: false, message: 'Lowongan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 2. Cek apakah job target sudah memiliki embedding, jika belum, buat on-the-fly
    const targetEmbeddingExists = await (prisma as any).$queryRaw`
      SELECT id FROM job_embeddings WHERE job_id = ${jobId}::uuid LIMIT 1;
    `;

    if (!Array.isArray(targetEmbeddingExists) || targetEmbeddingExists.length === 0) {
      try {
        const textContent = `${targetJob.title}. Lokasi: ${targetJob.location || ''}. Kualifikasi: ${
          Array.isArray(targetJob.requirements) ? targetJob.requirements.join(', ') : ''
        }. ${targetJob.description || ''}`.slice(0, 1500);

        const vector = await generateEmbedding(textContent, 'passage');
        const vectorStr = `[${vector.join(',')}]`;
        const hash = computeEmbeddingHash(textContent);

        await (prisma as any).$executeRaw`
          INSERT INTO job_embeddings (id, job_id, embedding, content_hash, created_at, updated_at)
          VALUES (gen_random_uuid(), ${jobId}::uuid, ${vectorStr}::vector, ${hash}, NOW(), NOW())
          ON CONFLICT (job_id) DO NOTHING;
        `;
      } catch (embErr) {
        console.warn('[Similar Jobs] Gagal on-the-fly embedding:', embErr);
      }
    }

    // 3. Cari lowongan serupa dengan jarak Cosine (pgvector)
    try {
      const similarJobs = await (prisma as any).$queryRaw`
        SELECT 
          j.id, j.title, j.location, j.work_type, j.salary_min, j.salary_max, j.slug, j.tags,
          j.description, j.requirements, j.external_url,
          c.name as company_name,
          ROUND(((1 - (target_je.embedding <=> je.embedding)) * 100)::numeric, 0) AS similarity_score
        FROM job_embeddings target_je
        JOIN job_embeddings je ON target_je.job_id != je.job_id
        JOIN jobs j ON je.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE target_je.job_id = ${jobId}::uuid AND j.is_active = true
        ORDER BY target_je.embedding <=> je.embedding ASC
        LIMIT ${limit};
      `;

      if (Array.isArray(similarJobs) && similarJobs.length > 0) {
        return NextResponse.json({
          success: true,
          isSemantic: true,
          data: similarJobs.map((j: any) => ({
            ...j,
            similarity_score: Number(j.similarity_score) || 75,
          })),
        });
      }
    } catch (vectorSearchErr) {
      console.warn('[Similar Jobs Vector Search Warning]:', vectorSearchErr);
    }

    // 4. Fallback jika pgvector tidak mengembalikan data: cari berdasarkan judul kata kunci
    const titleKeyword = targetJob.title.split(/\s+/)[0] || '';
    const fallbackJobs = await prisma.jobs.findMany({
      where: {
        is_active: true,
        id: { not: jobId },
        title: { contains: titleKeyword, mode: 'insensitive' },
      },
      take: limit,
      include: {
        companies: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      isSemantic: false,
      data: fallbackJobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        work_type: j.work_type,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        slug: j.slug,
        tags: j.tags,
        description: j.description,
        requirements: j.requirements,
        external_url: j.external_url,
        company_name: j.companies?.name || 'Perusahaan Mitra',
        similarity_score: null,
      })),
    });
  } catch (error: any) {
    console.error('[API Jobs Similar Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat lowongan serupa.' },
      { status: 500 }
    );
  }
}
