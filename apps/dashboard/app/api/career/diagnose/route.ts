import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';
import { computeSemanticCareerDiagnosis } from '@/lib/career-embedding-diagnosis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      aimingChoice = 'know_role',
      targetRoleInput = '',
      skills = [],
      educationLevel = '',
      major = '',
      hasExperience = null,
      experienceTitle = '',
      experienceCompany = '',
      experiences = [],
      projects = [],
      topAchievementSnippet = '',
      summary = '',
      dynamicBlueprints = [],
    } = body || {};

    const user = await getAuthUser(req);

    const diagnosis = await computeSemanticCareerDiagnosis({
      aimingChoice,
      targetRoleInput,
      userSkills: Array.isArray(skills) ? skills : [],
      educationLevel: typeof educationLevel === 'string' ? educationLevel : '',
      major: typeof major === 'string' ? major : '',
      hasExperience: typeof hasExperience === 'boolean' ? hasExperience : null,
      experienceTitle: typeof experienceTitle === 'string' ? experienceTitle : '',
      experienceCompany: typeof experienceCompany === 'string' ? experienceCompany : '',
      experiences: Array.isArray(experiences) ? experiences : [],
      projects: Array.isArray(projects) ? projects : [],
      topAchievementSnippet: typeof topAchievementSnippet === 'string' ? topAchievementSnippet : '',
      summary: typeof summary === 'string' ? summary : '',
      dynamicBlueprints: Array.isArray(dynamicBlueprints) ? dynamicBlueprints : [],
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      isSemantic: true,
      data: diagnosis,
    });
  } catch (error: any) {
    console.error('[POST /api/career/diagnose] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memproses diagnosis semantik karier.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
