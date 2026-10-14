import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@employr/db';
import { generateEmbedding } from '@/lib/embedding-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24', 10), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);
    const workType = (searchParams.get('workType') || searchParams.get('type') || '').toUpperCase();

    const workTypeFilter: any = {};
    if (workType && workType !== 'ALL') {
      if (workType === 'REMOTE') {
        workTypeFilter.work_type = { in: ['REMOTE', 'ONLINE'] };
      } else if (workType === 'HYBRID') {
        workTypeFilter.work_type = 'HYBRID';
      } else if (workType === 'ONSITE') {
        workTypeFilter.work_type = 'ONSITE';
      }
    }

    // 1. Jika query kosong, kembalikan lowongan terbaru
    if (!query) {
      const latestJobs = await prisma.jobs.findMany({
        where: {
          is_active: true,
          ...workTypeFilter,
        },
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          companies: {
            select: { name: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        isSemantic: false,
        data: latestJobs.map((j) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          work_type: j.work_type,
          salary_min: j.salary_min,
          salary_max: j.salary_max,
          slug: j.slug,
          tags: j.tags,
          company_name: j.companies?.name || 'Perusahaan Mitra',
          similarity_score: null,
        })),
      });
    }

    // 2. Pencarian Semantik via Multilingual-E5-Small + pgvector (Hanya pada page pertama)
    let semanticMapped: any[] = [];
    if (offset === 0) {
      try {
        const queryVector = await generateEmbedding(query, 'query');
        const vectorStr = `[${queryVector.join(',')}]`;

        const workTypeCondition = workType === 'REMOTE'
          ? Prisma.sql`AND j.work_type IN ('REMOTE', 'ONLINE')`
          : workType === 'HYBRID'
          ? Prisma.sql`AND j.work_type = 'HYBRID'`
          : workType === 'ONSITE'
          ? Prisma.sql`AND j.work_type = 'ONSITE'`
          : Prisma.empty;

        const semanticMatches = await (prisma as any).$queryRaw`
          SELECT 
            j.id, j.title, j.location, j.work_type, j.salary_min, j.salary_max, j.slug, j.tags,
            c.name as company_name,
            ROUND(((1 - (je.embedding <=> ${vectorStr}::vector)) * 100)::numeric, 0) AS similarity_score
          FROM jobs j
          JOIN job_embeddings je ON j.id = je.job_id
          LEFT JOIN companies c ON j.company_id = c.id
          WHERE j.is_active = true
            ${workTypeCondition}
          ORDER BY je.embedding <=> ${vectorStr}::vector ASC
          LIMIT ${limit};
        `;

        if (Array.isArray(semanticMatches) && semanticMatches.length > 0) {
          semanticMapped = semanticMatches.map((j: any) => ({
            ...j,
            similarity_score: Number(j.similarity_score) || 0,
          }));
        }
      } catch (semanticError) {
        console.warn('[Semantic Search Warning] Falling back to text search:', semanticError);
      }
    }

    // 3. Lengkapi pencarian dengan teks biasa (ILIKE) dari basis data riil
    const textMatches = await prisma.jobs.findMany({
      where: {
        is_active: true,
        ...workTypeFilter,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip: offset,
      take: limit,
      include: {
        companies: {
          select: { name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const mappedTextMatches = textMatches.map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      work_type: j.work_type,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      slug: j.slug,
      tags: j.tags,
      company_name: j.companies?.name || 'Perusahaan Mitra',
      similarity_score: null,
    }));

    // 4. Hybrid Search Fusion via Reciprocal Rank Fusion (RRF)
    const rrfScores = new Map<string, { job: any; score: number }>();
    const RRF_K = 60;

    mappedTextMatches.forEach((job, rank) => {
      const current = rrfScores.get(job.id) || { job, score: 0 };
      current.score += 1.2 / (RRF_K + rank + 1); // Presisi leksikal judul
      rrfScores.set(job.id, current);
    });

    semanticMapped.forEach((job, rank) => {
      const current = rrfScores.get(job.id) || { job, score: 0 };
      current.score += 1.0 / (RRF_K + rank + 1); // Kedekatan semantik
      rrfScores.set(job.id, current);
    });

    const combined = Array.from(rrfScores.values())
      .sort((a, b) => b.score - a.score)
      .map((item) => item.job)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      isSemantic: semanticMapped.length > 0,
      query,
      data: combined,
    });
  } catch (error: any) {
    console.error('[API Jobs Search Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kendala saat mencari lowongan.' },
      { status: 500 }
    );
  }
}
