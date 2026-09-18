import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, feature, context_id, rating, comment, page_path } = body;

    // Auth: verify the caller is actually logged in
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting: max 30 feedback per minute per user
    const rl = checkRateLimit(`feedback:${authUser.id}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak feedback. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    if (!feature || rating === undefined) {
      return NextResponse.json(
        { success: false, message: 'feature and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating: -1 (thumbs down), 0 (neutral), 1 (thumbs up)
    if (![-1, 0, 1].includes(rating)) {
      return NextResponse.json(
        { success: false, message: 'rating must be -1, 0, or 1' },
        { status: 400 }
      );
    }

    // Validate feature
    const validFeatures = ['ats_score', 'ai_suggestion', 'job_recommendation', 'career_readiness', 'cv_template', 'job_match', 'general'];
    if (!validFeatures.includes(feature)) {
      return NextResponse.json(
        { success: false, message: `feature must be one of: ${validFeatures.join(', ')}` },
        { status: 400 }
      );
    }

    await (prisma as any).userFeedback.create({
      data: {
        user_id: authUser.id,
        feature,
        context_id: context_id || null,
        rating,
        comment: comment || null,
        page_path: page_path || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Feedback API] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
