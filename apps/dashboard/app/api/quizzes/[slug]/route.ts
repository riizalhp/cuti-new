import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import crypto from 'crypto';

/**
 * GET /api/quizzes/[slug]
 * Detail paket + pertanyaan (TANPA correct_answer, explanation, ai_tip).
 * Jawaban tidak dikirim ke client agar tidak bisa dicurri via DevTools.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const pkg = await prisma.quiz_packages.findUnique({
      where: { slug },
      include: {
        questions: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!pkg || !pkg.is_active) {
      return NextResponse.json(
        { success: false, message: 'Paket quiz tidak ditemukan.' },
        { status: 404 }
      );
    }

    const questions = pkg.questions.map((q) => ({
      id: q.sort_order,
      type: q.type,
      question: q.question,
      codeSnippet: q.code_snippet || undefined,
      options: q.options ?? undefined,
    }));

    // Pastikan ada baris attempt (untuk restore progress "belum_selesai")
    const existing = await prisma.quiz_attempts.findUnique({
      where: { user_id_package_id: { user_id: user.id, package_id: pkg.id } },
    });
    if (!existing) {
      await prisma.quiz_attempts.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          package_id: pkg.id,
          status: 'belum_selesai',
          started_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: pkg.slug,
        title: pkg.title,
        category: pkg.category,
        description: pkg.description,
        durationMinutes: pkg.duration_minutes,
        difficulty: pkg.difficulty,
        passingScore: pkg.passing_score,
        questions,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/quizzes/[slug]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat detail quiz.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes/[slug]
 * Submit hasil ujian: hitung skor SERVER-SIDE dari jawaban user.
 * Body: { answers: Record<number, string|string[]>, timeSpentSeconds, flaggedQuestions }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.answers !== 'object' || body.answers === null) {
      return NextResponse.json(
        { success: false, message: 'Data jawaban tidak valid.' },
        { status: 400 }
      );
    }

    const pkg = await prisma.quiz_packages.findUnique({
      where: { slug },
      include: { questions: { orderBy: { sort_order: 'asc' } } },
    });
    if (!pkg) {
      return NextResponse.json(
        { success: false, message: 'Paket quiz tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Penilaian di server: kunci jawaban tidak pernah dikirim ke client
    let correctCount = 0;
    const review = pkg.questions.map((q) => {
      const userAns = body.answers[String(q.sort_order)];
      let isCorrect = false;

      if (userAns !== undefined && userAns !== null) {
        if (q.type === 'multiple-select') {
          const correct = Array.isArray(q.correct_answer) ? [...q.correct_answer].sort() : [];
          const given = Array.isArray(userAns) ? [...userAns].sort() : [];
          isCorrect = JSON.stringify(correct) === JSON.stringify(given);
        } else {
          isCorrect =
            String(userAns).trim().toLowerCase() ===
            String(q.correct_answer).trim().toLowerCase();
        }
      }
      if (isCorrect) correctCount++;

      return {
        id: q.sort_order,
        isCorrect,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        aiTip: q.ai_tip,
      };
    });

    const score = Math.round((correctCount / pkg.questions.length) * 100);
    const passed = score >= pkg.passing_score;
    const now = new Date();

    const attemptData = {
      status: 'selesai' as const,
      score,
      answers: body.answers as any,
      flagged_questions: Array.isArray(body.flaggedQuestions) ? body.flaggedQuestions : [],
      completed_at: now,
      time_spent_seconds:
        typeof body.timeSpentSeconds === 'number' && body.timeSpentSeconds >= 0
          ? Math.round(body.timeSpentSeconds)
          : 0,
    };

    await prisma.quiz_attempts.upsert({
      where: { user_id_package_id: { user_id: user.id, package_id: pkg.id } },
      update: attemptData,
      create: {
        id: crypto.randomUUID(),
        user_id: user.id,
        package_id: pkg.id,
        ...attemptData,
      },
    });

    return NextResponse.json({
      success: true,
      data: { score, passed, correctCount, total: pkg.questions.length, review },
    });
  } catch (error: any) {
    console.error('[POST /api/quizzes/[slug]] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan hasil quiz.' },
      { status: 500 }
    );
  }
}
