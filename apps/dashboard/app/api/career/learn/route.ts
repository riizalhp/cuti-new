import { NextRequest, NextResponse } from 'next/server';
import { learnedRoleService } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role_name, skills, education_level, major } = body || {};

    if (!role_name || typeof role_name !== 'string' || !role_name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama peran target harus diisi.' },
        { status: 400 }
      );
    }

    const user = await getAuthUser(req);

    const result = await learnedRoleService.recordEntry({
      role_name: role_name.trim(),
      skills: Array.isArray(skills) ? skills : [],
      education_level: typeof education_level === 'string' ? education_level : null,
      major: typeof major === 'string' ? major : null,
      user_id: user?.id || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Data arah karier berhasil dicatat untuk pembelajaran sistem.',
      data: result,
    });
  } catch (error: any) {
    console.error('[POST /api/career/learn] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses data pembelajaran peran.' },
      { status: 500 }
    );
  }
}
