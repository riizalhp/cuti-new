import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const zipPath = path.join(process.cwd(), 'public', 'employr-extension.zip');
    if (!fs.existsSync(zipPath)) {
      return NextResponse.json({ error: 'File ekstensi belum tersedia.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(zipPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="employr-linkedin-assistant.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengunduh ekstensi.' }, { status: 500 });
  }
}
