import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

/**
 * GET /api/quizzes
 * Daftar paket quiz aktif + jumlah soal & attempts. Tanpa isi pertanyaan
 * (jawaban tidak boleh bocor ke client sebelum ujian dimulai).
 */
export async function GET(req: NextRequest) {
  try {
    const rows = await prisma.quiz_packages.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });

    // Attempts milik user (untuk status progress)
    const user = await getAuthUser(req);
    let userAttempts: Record<string, any> = {};
    if (user) {
      const attempts = await prisma.quiz_attempts.findMany({
        where: { user_id: user.id },
      });
      userAttempts = Object.fromEntries(
        attempts.map((a) => [
          a.package_id,
          {
            status: a.status,
            score: a.score,
            timeSpentSeconds: a.time_spent_seconds,
            completedAt: a.completed_at,
          },
        ])
      );
    }

    const data = rows.map((r) => ({
      id: r.slug,
      dbId: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      durationMinutes: r.duration_minutes,
      difficulty: r.difficulty,
      isPremium: r.is_premium,
      price: r.price,
      passingScore: r.passing_score,
      questionCount: r._count.questions,
      totalAttemptsCount: r._count.attempts,
      attempt: userAttempts[r.id] || null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /api/quizzes] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar quiz.' },
      { status: 500 }
    );
  }
}
