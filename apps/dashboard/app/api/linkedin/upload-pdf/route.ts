import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInPdf } from '@/lib/linkedin-pdf-parser';
import { getAuthUser } from '@/lib/server-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File PDF LinkedIn belum dipilih.' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Format file harus PDF (.pdf).' },
        { status: 400 }
      );
    }

    // Ambil ID user jika sedang terautentikasi (untuk pencatatan pemakaian AI)
    let userId: string | undefined;
    try {
      const user = await getAuthUser(req);
      if (user?.id) userId = user.id;
    } catch {}

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const profileData = await parseLinkedInPdf(buffer, userId);

    return NextResponse.json({
      success: true,
      data: profileData,
      message: 'Profil LinkedIn berhasil diekstrak dari PDF.',
    });
  } catch (error: any) {
    console.error('[POST /api/linkedin/upload-pdf] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal membaca file PDF profil LinkedIn.' },
      { status: 500 }
    );
  }
}
