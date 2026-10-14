import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '6', 10), 1), 20);

    // 1. Cek apakah pengguna login dan memiliki profil vektor
    if (user?.id) {
      const userEmbeddingExists = await (prisma as any).$queryRaw`
        SELECT id FROM user_career_embeddings WHERE user_id = ${user.id}::uuid LIMIT 1;
      `;

      if (Array.isArray(userEmbeddingExists) && userEmbeddingExists.length > 0) {
        // Query pgvector Cosine Distance: 1 - (je.embedding <=> ue.embedding)
        const matchedJobs = await (prisma as any).$queryRaw`
          SELECT 
            j.id, j.title, j.location, j.work_type, j.salary_min, j.salary_max, j.slug, j.tags,
            c.name as company_name,
            ROUND(((1 - (je.embedding <=> ue.embedding)) * 100)::numeric, 0) AS match_score
          FROM jobs j
          JOIN job_embeddings je ON j.id = je.job_id
          LEFT JOIN companies c ON j.company_id = c.id
          CROSS JOIN user_career_embeddings ue
          WHERE ue.user_id = ${user.id}::uuid AND j.is_active = true
          ORDER BY je.embedding <=> ue.embedding ASC
          LIMIT ${limit};
        `;

        if (Array.isArray(matchedJobs) && matchedJobs.length > 0) {
          return NextResponse.json({
            success: true,
            isPersonalized: true,
            data: matchedJobs.map((j: any) => ({
              ...j,
              match_score: Number(j.match_score) || 85,
            })),
          });
        }
      }
    }

    // 2. Fallback untuk pengguna baru atau tamu: Tampilkan loker aktif terbaru
    const fallbackJobs = await prisma.jobs.findMany({
      where: { is_active: true },
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
      isPersonalized: false,
      data: fallbackJobs.map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        work_type: j.work_type,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        slug: j.slug,
        tags: j.tags,
        company_name: j.companies?.name || 'Perusahaan Mitra',
        match_score: 85, // Default score
      })),
    });
  } catch (error: any) {
    console.error('[API Jobs Recommendations Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil rekomendasi lowongan pekerjaan.' },
      { status: 500 }
    );
  }
}
