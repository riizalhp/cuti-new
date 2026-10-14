import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@employr/db';
import { parseLinkedInAuditName, buildLinkedInAuditSlug } from '@/lib/linkedin-slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const nameParam = searchParams.get('name');

    if (!roleParam || !nameParam) {
      return NextResponse.json(
        { success: false, message: 'Parameter role dan nama wajib disertakan.' },
        { status: 400 }
      );
    }

    const { cleanName, shortId } = parseLinkedInAuditName(nameParam);

    let record: any = null;

    // 1. Jika ada short hash di nama (misal riizalhp-f8e995d2)
    if (shortId) {
      const results: any[] = await (prisma as any).$queryRaw`
        SELECT * FROM ai_generation_history
        WHERE section_key = 'linkedin_analysis'
          AND id::text LIKE ${shortId.toLowerCase() + '%'}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (results && results.length > 0) {
        record = results[0];
      }
    }

    // 2. Jika belum ketemu atau tanpa shortId, cari berdasarkan slug di options
    if (!record) {
      const targetSlug = `${roleParam.toLowerCase()}/${cleanName.toLowerCase()}`;
      const slugResults: any[] = await (prisma as any).$queryRaw`
        SELECT * FROM ai_generation_history
        WHERE section_key = 'linkedin_analysis'
          AND (
            options->>'slug' = ${targetSlug}
            OR options->>'nameSlug' = ${cleanName.toLowerCase()}
          )
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (slugResults && slugResults.length > 0) {
        record = slugResults[0];
      }
    }

    // 3. Fallback: cari berdasarkan kemiripan profileUrl atau target_job_title
    if (!record) {
      const fallbackResults: any[] = await (prisma as any).$queryRaw`
        SELECT * FROM ai_generation_history
        WHERE section_key = 'linkedin_analysis'
          AND (
            input_text ILIKE ${'%' + cleanName + '%'}
            OR options->>'profileUrl' ILIKE ${'%' + cleanName + '%'}
          )
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (fallbackResults && fallbackResults.length > 0) {
        record = fallbackResults[0];
      }
    }

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Hasil analisis profil LinkedIn tidak ditemukan.' },
        { status: 404 }
      );
    }

    const rawOptions = typeof record.options === 'object' && record.options !== null
      ? record.options
      : (typeof record.options === 'string' ? JSON.parse(record.options) : {});

    const resolvedRole = record.target_job_title || rawOptions.targetRole || 'Professional';
    const resolvedName = rawOptions.profileUrl || rawOptions.scrapedData?.name || rawOptions.evidenceBank?.fullName || record.input_text || '';
    const { roleSlug, nameSlug, fullSlug, auditPath } = buildLinkedInAuditSlug(
      resolvedRole,
      resolvedName
    );

    const formattedData = {
      id: record.id,
      userId: record.user_id,
      createdAt: record.created_at,
      sectionTitle: record.section_title,
      targetRole: resolvedRole,
      targetIndustry: record.goal || '',
      profileUrl: rawOptions.profileUrl || record.input_text || '',
      overallScore: rawOptions.overallScore || rawOptions.analysisResult?.overallScore || 0,
      analysisResult: rawOptions.analysisResult || null,
      scrapedData: rawOptions.scrapedData || null,
      evidenceBank: rawOptions.evidenceBank || null,
      checklist: rawOptions.checklist || null,
      roleSlug,
      nameSlug,
      slug: rawOptions.slug || fullSlug,
      auditPath: rawOptions.auditPath || auditPath,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error('[GET /api/linkedin/resolve] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mencari data analisis LinkedIn.', error: error?.message },
      { status: 500 }
    );
  }
}
