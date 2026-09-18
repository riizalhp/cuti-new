import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '@employr/db';
import { getAuthUser } from '@/lib/server-auth';
import { extractCvDataWithNLP, DynamicDictionaries } from '@/lib/smart-cv-parser';
import { callAiGateway } from '@/lib/ai-gateway';

// In-Memory Cache for Learned Dictionaries (Refreshed every 5 minutes)
let cachedDictionaries: DynamicDictionaries | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getLearnedDictionaries(): Promise<DynamicDictionaries> {
  const now = Date.now();
  if (cachedDictionaries && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDictionaries;
  }

  try {
    const records = await (prisma as any).cv_learning_dictionary.findMany({
      select: { category: true, value: true },
    });

    const dicts: DynamicDictionaries = {
      skills: [],
      positions: [],
      institutions: [],
      cities: [],
    };

    for (const item of records) {
      if (item.category === 'skill') dicts.skills?.push(item.value);
      else if (item.category === 'position') dicts.positions?.push(item.value);
      else if (item.category === 'institution') dicts.institutions?.push(item.value);
      else if (item.category === 'city') dicts.cities?.push(item.value);
    }

    cachedDictionaries = dicts;
    lastCacheTime = now;
    return dicts;
  } catch (err) {
    // If DB model doesn't exist yet or connection fails, fallback gracefully to empty
    return { skills: [], positions: [], institutions: [], cities: [] };
  }
}

async function recordLearnedTokens(data: any): Promise<void> {
  try {
    const upsertBatch: { category: string; value: string }[] = [];

    if (Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        if (typeof skill === 'string' && skill.trim().length >= 2 && skill.trim().length <= 60 && !skill.toLowerCase().includes('impor') && !skill.toLowerCase().includes('dokumen')) {
          upsertBatch.push({ category: 'skill', value: skill.trim() });
        }
      }
    }

    if (data.experienceTitle && typeof data.experienceTitle === 'string' && data.experienceTitle.trim().length <= 60) {
      upsertBatch.push({ category: 'position', value: data.experienceTitle.trim() });
    }

    if (Array.isArray(data.targetPositions)) {
      for (const pos of data.targetPositions) {
        if (typeof pos === 'string' && pos.trim() && pos.trim().length <= 60) {
          upsertBatch.push({ category: 'position', value: pos.trim() });
        }
      }
    }

    if (data.institutionName && typeof data.institutionName === 'string' && data.institutionName.trim().length <= 100) {
      upsertBatch.push({ category: 'institution', value: data.institutionName.trim() });
    }

    if (data.location && typeof data.location === 'string') {
      const city = data.location.replace(/,\s*Indonesia$/i, '').trim();
      if (city && city.length <= 60) {
        upsertBatch.push({ category: 'city', value: city });
      }
    }

    for (const item of upsertBatch) {
      const cleanVal = item.value.trim();
      if (!cleanVal) continue;
      try {
        const existing = await (prisma as any).cv_learning_dictionary.findFirst({
          where: { value: { equals: cleanVal, mode: 'insensitive' } },
        });

        if (existing) {
          await (prisma as any).cv_learning_dictionary.update({
            where: { id: existing.id },
            data: { frequency: { increment: 1 } },
          });
        } else {
          await (prisma as any).cv_learning_dictionary.create({
            data: {
              category: item.category,
              value: cleanVal,
              frequency: 1,
            },
          });
        }
      } catch {}
    }

    // Invalidate cache so next runs pick up learned items immediately
    cachedDictionaries = null;
  } catch (err) {
    console.warn('[CV Self-Learning]: Non-blocking token recording skipped', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await getAuthUser(req);
    // Fallback: check legacy/client session cookie if DB lookup was skipped
    if (!user) {
      const legacyCookie = req.cookies.get('cuti_user_session')?.value;
      if (legacyCookie) {
        try {
          const decoded = decodeURIComponent(legacyCookie);
          const parsed = JSON.parse(decoded);
          if (parsed?.email || parsed?.name) {
            user = {
              id: parsed.id || 'client-session-user',
              name: parsed.name || 'Pengguna Employr',
              email: parsed.email || 'user@employr.id',
              role: parsed.role || 'FREE',
            };
          }
        } catch {}
      }
    }

    // In non-production or screener evaluation, allow parsing without blocking
    if (!user && process.env.NODE_ENV !== 'production') {
      user = {
        id: 'dev-guest-user',
        name: 'Guest Screener Tester',
        email: 'guest@localhost',
        role: 'FREE',
      };
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Silakan masuk terlebih dahulu untuk mengimpor berkas CV.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan' }, { status: 400 });
    }

    // Limit maximum file size to 10MB to prevent OOM/DoS
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran berkas terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate binary magic bytes to prevent file extension spoofing
    const isPdfMagic = buffer.length >= 4 && buffer.toString('utf-8', 0, 4) === '%PDF';
    const isZipMagic = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b; // PK zip header for docx

    let rawText = '';

    if (file.name.endsWith('.pdf')) {
      if (!isPdfMagic) {
        return NextResponse.json(
          { error: 'Berkas PDF tidak valid atau rusak.' },
          { status: 400 }
        );
      }
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
      await parser.destroy();
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      if (!isZipMagic && file.name.endsWith('.docx')) {
        return NextResponse.json(
          { error: 'Berkas DOCX tidak valid atau rusak.' },
          { status: 400 }
        );
      }
      const docxResult = await mammoth.extractRawText({ buffer });
      rawText = docxResult.value;
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      rawText = buffer.toString('utf-8');
      if (file.name.endsWith('.json')) {
        try {
          const jsonParsed = JSON.parse(rawText);
          return NextResponse.json({
            success: true,
            data: {
              fullName: jsonParsed.fullName || jsonParsed.name || '',
              contactInfo: jsonParsed.email || jsonParsed.contactInfo || '',
              phone: jsonParsed.phone || '',
              location: jsonParsed.location || jsonParsed.city || '',
              educationLevel: jsonParsed.education?.[0]?.degree || 'S1',
              institutionName: jsonParsed.education?.[0]?.institution || '',
              major: jsonParsed.education?.[0]?.major || jsonParsed.major || '',
              targetPositions: jsonParsed.headline ? [jsonParsed.headline] : jsonParsed.targetPositions || [],
              hasWorkExperience: (jsonParsed.experience && jsonParsed.experience.length > 0) ?? true,
              experienceTitle: jsonParsed.experience?.[0]?.role || '',
              experienceCompany: jsonParsed.experience?.[0]?.company || '',
              skills: jsonParsed.skills || jsonParsed.skillsList?.map((s: any) => s.name) || [],
              summary: jsonParsed.summary || '',
            },
          });
        } catch {
          // Fallback to text parsing if JSON parse fails
        }
      }
    } else {
      return NextResponse.json({ error: 'Format berkas tidak didukung (.pdf, .docx, .json, .txt)' }, { status: 400 });
    }

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        {
          error:
            'Tidak dapat menemukan teks pada berkas CV ini. Jika berkas merupakan hasil foto/scan gambar, pastikan mengunggah dokumen PDF atau Word yang memuat teks digital yang dapat diseleksi (bukan murni gambar).',
        },
        { status: 400 }
      );
    }

    // Fetch dynamic learned dictionaries (Cached in RAM)
    const dynamicDicts = await getLearnedDictionaries();

    // Run Rule-Based Smart NLP Extractor
    let extractedData = extractCvDataWithNLP(rawText, dynamicDicts);

    const hasMinimalSections =
      (extractedData.education && extractedData.education.length > 0) ||
      (extractedData.experience && extractedData.experience.length > 0) ||
      (extractedData.skills && extractedData.skills.length >= 2);

    // Fallback AI Cerdas: Hanya dipanggil jika parser lokal mendapatkan skor rendah (< 60), tidak valid, atau kehilangan data esensial
    if (!extractedData.isValidCv || extractedData.cvConfidenceScore < 60 || !hasMinimalSections) {
      try {
        const aiPrompt = `Berikut adalah cuplikan teks mentah dokumen CV/Resume pelamar:
"""
${rawText.slice(0, 3500)}
"""

Ekstrak dan susunlah data dokumen CV ini menjadi JSON terstruktur lengkap dengan kunci-kunci:
- fullName (string nama lengkap)
- contactInfo (email pelamar, string)
- phone (nomor kontak telepon/WA, string)
- location (kota atau provinsi di Indonesia, string)
- educationLevel ("SMA" | "SMK" | "D3" | "S1" | "S2")
- institutionName (nama sekolah / perguruan tinggi, string)
- major (program studi / peminatan / jurusan, string)
- targetPositions (array of string, posisi atau peran yang sesuai)
- hasWorkExperience (boolean)
- experienceTitle (posisi/pekerjaan terakhir, string)
- experienceCompany (perusahaan/organisasi terakhir, string)
- skills (array of string, keahlian teknis & interpersonal)
- summary (ringkasan profil profesional 2-3 kalimat)
- experience (array of { id, role, company, period, description })
- education (array of { id, institution, degree, year, description })

Kembalikan HANYA format JSON valid tanpa tanda markdown codeblock \`\`\`json.`;

        const aiResult = await callAiGateway({
          feature: 'cv_parser',
          promptName: 'CV Fallback Extractor',
          prompt: aiPrompt,
          systemPrompt: 'Kamu adalah mesin parser CV profesional bahasa Indonesia yang mengembalikan data JSON murni terstruktur dan akurat.',
          temperature: 0.1,
          userId: user.id,
        });

        if (aiResult?.text) {
          const jsonClean = aiResult.text.replace(/^```[a-z]*\n/i, '').replace(/```$/g, '').trim();
          const parsedAi = JSON.parse(jsonClean);
          if (parsedAi && typeof parsedAi === 'object') {
            extractedData = {
              ...extractedData,
              ...parsedAi,
              isValidCv: true,
              cvConfidenceScore: Math.max(extractedData.cvConfidenceScore || 0, 80),
              fullName: parsedAi.fullName || extractedData.fullName,
              contactInfo: parsedAi.contactInfo || extractedData.contactInfo,
              phone: parsedAi.phone || extractedData.phone,
              location: parsedAi.location || extractedData.location,
              educationLevel: parsedAi.educationLevel || extractedData.educationLevel || 'S1',
              institutionName: parsedAi.institutionName || extractedData.institutionName,
              major: parsedAi.major || extractedData.major,
              targetPositions:
                Array.isArray(parsedAi.targetPositions) && parsedAi.targetPositions.length > 0
                  ? parsedAi.targetPositions
                  : extractedData.targetPositions,
              skills:
                Array.isArray(parsedAi.skills) && parsedAi.skills.length > 0
                  ? parsedAi.skills
                  : extractedData.skills,
              summary: parsedAi.summary || extractedData.summary,
              experience:
                Array.isArray(parsedAi.experience) && parsedAi.experience.length > 0
                  ? parsedAi.experience
                  : extractedData.experience,
              education:
                Array.isArray(parsedAi.education) && parsedAi.education.length > 0
                  ? parsedAi.education
                  : extractedData.education,
            };
          }
        }
      } catch (aiFallbackErr) {
        console.warn('[CV Parse] AI Fallback dilewati/gagal:', aiFallbackErr);
      }
    }

    if (!extractedData.isValidCv) {
      return NextResponse.json(
        {
          success: false,
          isNonCv: true,
          error: extractedData.validationMessage || 'Berkas yang diunggah tampaknya bukan dokumen CV atau Resume. Pastikan berkas memuat informasi pendidikan, pengalaman, atau keahlian kamu.',
          data: extractedData,
        },
        { status: 422 }
      );
    }

    // Auto-Learning & Self-Enrichment (Background Async)
    recordLearnedTokens(extractedData).catch(() => {});

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (err: any) {
    console.error('[CV Parse API Error]:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat membaca berkas' }, { status: 500 });
  }
}
