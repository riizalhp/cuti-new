import { NextRequest, NextResponse } from 'next/server';
import { learnedRoleService } from '@employr/db';

export async function GET(req: NextRequest) {
  try {
    const blueprints = await learnedRoleService.getActiveLearnedBlueprints();
    return NextResponse.json({
      success: true,
      data: blueprints,
    });
  } catch (error: any) {
    console.error('[GET /api/career/blueprints] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat dynamic blueprints.' },
      { status: 500 }
    );
  }
}
